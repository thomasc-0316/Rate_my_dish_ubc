import { Box, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { listHalls } from '../api';
import DiningHallCard from '../components/DiningHallCard';

export default function HomePage() {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
        <Heading size="2xl">UBC Rate My Dish</Heading>
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
              logo={null}
            />
          ))}
      </SimpleGrid>
    </Box>
  );
}
