import { Link, useParams } from 'react-router-dom';
import { Accordion, Box, Button, Heading, Text, VStack, HStack, Image } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { getHallRating, listDishes, listHalls, listStations } from '../api';
import StationAccordionItem from '../components/StationAccordionItem';
import feastLogo from '../assets/feast_logo.png';
import gatherLogo from '../assets/gather_logo.png';
import openKitchenLogo from '../assets/open_kitchen_logo.png';

export default function DiningHallPage() {
  const { hallId = '' } = useParams(); // slug
  const [hallName, setHallName] = useState('');
  const [hallFound, setHallFound] = useState(true);
  const [nameLoading, setNameLoading] = useState(true);
  const [hallRating, setHallRating] = useState({ avg: 0, count: 0 });
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);
  const hallLogos = {
    feast: feastLogo,
    gather: gatherLogo,
    'open-kitchen': openKitchenLogo
  };

  const ratingColor = (avg, count) => {
    if (!count) return 'gray.600';
    if (avg >= 4) return 'green.500';
    if (avg >= 3) return 'yellow.500';
    return 'red.500';
  };

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setNameLoading(true);
        setStations([]);
        setHallFound(true);
        setHallRating({ avg: 0, count: 0 });

        const halls = await listHalls();
        const hall = halls.find((h) => h.slug === hallId);
        setHallFound(!!hall);
        setHallName(hall ? hall.name : '');
        if (!hall) return;

        const rating = await getHallRating(hallId);
        setHallRating(rating);

        const stationRows = await listStations(hallId);
        const withDishes = [];
        for (const station of stationRows) {
          const dishes = await listDishes(station.id);
          withDishes.push({ ...station, dishes });
        }
        setStations(withDishes);
      } catch (err) {
        console.error('Failed to load hall page', err);
      } finally {
        setNameLoading(false);
        setLoading(false);
      }
    })();
  }, [hallId]);

  if (!loading && !hallFound) {
    return (
      <Box p={{ base: 4, md: 10 }} maxW="960px" mx="auto">
        <Heading size="lg" mb={2}>
          UBC Rate My Dish
        </Heading>
        <Text color="gray.500">Dining hall not found.</Text>
        <Button as={Link} to="/" mt={4} variant="ghost">
          {'<- Back to Home'}
        </Button>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 10 }} maxW="960px" mx="auto">
      <VStack align="center" spacing={2} mb={6}>
        <HStack spacing={4} align="center">
          {hallLogos[hallId] && (
            <Image src={hallLogos[hallId]} alt={`${hallName || hallId} logo`} boxSize="56px" objectFit="contain" />
          )}
          <Heading size="3xl" color="black">
            {nameLoading ? 'Loading hall...' : hallName || 'Dining Hall'}
          </Heading>
        </HStack>
        <Text fontWeight="semibold" color={ratingColor(hallRating.avg, hallRating.count)}>
          {hallRating.count > 0
            ? `Overall rating: ${hallRating.avg.toFixed(1)}/5 (${hallRating.count} ratings)`
            : 'No ratings yet'}
        </Text>
      </VStack>

      <Button as={Link} to="/" variant="ghost" mb={6}>
        {'<- Back to Home'}
      </Button>

      {loading ? (
        <Text color="gray.600">Loading stations...</Text>
      ) : (
        <>
          <Accordion allowMultiple>
            {stations.map((station) => (
              <StationAccordionItem key={station.id} station={station} hallId={hallId} />
            ))}
          </Accordion>
          {stations.length === 0 && (
            <Box p={6} borderWidth="1px" borderRadius="md" textAlign="center" color="gray.500">
              Menu information not yet available for this date.
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
