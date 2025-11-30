import { Box, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { useEffect, useMemo, useState } from 'react';
import { listHalls } from '../api';
import DiningHallCard from '../components/DiningHallCard';
import feastLogo from '../assets/feast_logo.png';
import gatherLogo from '../assets/gather_logo.png';
import openKitchenLogo from '../assets/open_kitchen_logo.png';

const FOOD_EMOJIS = ['🥗', '🍜', '🍕', '🍣', '🥘', '🍰', '🍔', '🍟', '🌮', '🍙', '🍛', '🥪'];

export default function HomePage() {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [emojiLine, setEmojiLine] = useState('');

  const hallLogos = {
    feast: feastLogo,
    gather: gatherLogo,
    'open-kitchen': openKitchenLogo
  };

  const pickRandomEmojis = useMemo(
    () => () => {
      const shuffled = [...FOOD_EMOJIS].sort(() => Math.random() - 0.5);
      return shuffled.slice(0, 6).join(' ');
    },
    []
  );

  useEffect(() => {
    setEmojiLine(pickRandomEmojis());
    (async () => {
      try {
        const data = await listHalls();
        setHalls(data);
      } catch (err) {
        console.error('Failed to load halls', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Box px={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }} maxW="1200px" mx="auto" textAlign="center">
      <VStack spacing={3} mb={8}>
        <Heading size="3xl">UBC Rate My Dish</Heading>
        <Text
          fontSize="xl"
          sx={{
            '@keyframes floaty': {
              '0%': { transform: 'translateY(0)' },
              '50%': { transform: 'translateY(-4px)' },
              '100%': { transform: 'translateY(0)' }
            },
            animation: 'floaty 2.6s ease-in-out infinite'
          }}
        >
          {emojiLine}
        </Text>
        <Text color="gray.600">Rate and discover the best dishes at UBC&apos;s dining halls.</Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {loading && (
          <Box gridColumn={{ base: 'span 1', md: 'span 3' }}>
            <Text color="gray.600">Loading halls...</Text>
          </Box>
        )}
        {!loading &&
          halls.map((hall) => (
            <DiningHallCard
              key={hall.id}
              hallId={hall.slug}
              name={hall.name}
              logo={hallLogos[hall.slug] ?? null}
            />
          ))}
      </SimpleGrid>
    </Box>
  );
}
