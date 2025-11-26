import { Link, useParams } from 'react-router-dom';
import { Accordion, Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { listDishes, listHalls, listStations } from '../api';
import StationAccordionItem from '../components/StationAccordionItem';

export default function DiningHallPage() {
  const { hallId = '' } = useParams(); // slug
  const [hallName, setHallName] = useState('');
  const [stations, setStations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setStations([]);

        const halls = await listHalls();
        const hall = halls.find((h) => h.slug === hallId);
        setHallName(hall ? hall.name : '');
        if (!hall) return;

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
        setLoading(false);
      }
    })();
  }, [hallId]);

  if (!loading && !hallName) {
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
      <VStack align="flex-start" spacing={2} mb={6}>
        <Heading size="lg" color="black">
          {hallName || 'Dining Hall'}
        </Heading>
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
