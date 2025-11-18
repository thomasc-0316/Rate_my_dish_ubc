import { Link, useParams } from 'react-router-dom';
import { Accordion, Box, Button, Heading, Text, VStack } from '@chakra-ui/react';
import { getHall } from '../data/mockMenu';
import StationAccordionItem from '../components/StationAccordionItem';

export default function DiningHallPage() {
  const { hallId = '' } = useParams();
  const hall = getHall(hallId);
  const hallStations = hall?.stations ?? [];

  if (!hall) {
    return (
      <Box p={{ base: 4, md: 10 }} maxW="960px" mx="auto">
        <Heading size="lg" mb={2}>
          UBC Rate My Dish
        </Heading>
        <Text color="gray.500">Dining hall not found.</Text>
        <Button as={Link} to="/" mt={4} variant="ghost">
          ← Back to Home
        </Button>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 10 }} maxW="960px" mx="auto">
      <VStack align="flex-start" spacing={2} mb={6}>
        <Heading size="lg" color="black">
          {hall.name} Dining Hall
        </Heading>
      </VStack>

      <Button as={Link} to="/" variant="ghost" mb={6}>
        ← Back to Home
      </Button>

      <Accordion allowMultiple>
        {hallStations.map((station) => (
          <StationAccordionItem key={station.id} station={station} hallId={hallId} />
        ))}
      </Accordion>
      {hallStations.length === 0 && (
        <Box p={6} borderWidth="1px" borderRadius="md" textAlign="center" color="gray.500">
          Menu information not yet available for this date.
        </Box>
      )}
    </Box>
  );
}
