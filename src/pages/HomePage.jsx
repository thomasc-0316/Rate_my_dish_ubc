import { Box, Heading, SimpleGrid, Text, VStack } from '@chakra-ui/react';
import { hallList } from '../data/mockMenu';
import DiningHallCard from '../components/DiningHallCard';

export default function HomePage() {
  return (
    <Box px={{ base: 4, md: 6 }} py={{ base: 8, md: 12 }} maxW="1200px" mx="auto" textAlign="center">
      <VStack spacing={3} mb={8}>
        <Heading size="2xl">UBC Rate My Dish</Heading>
        <Text color="gray.600">Rate and discover the best dishes at UBC&apos;s dining halls.</Text>
      </VStack>

      <SimpleGrid columns={{ base: 1, md: 3 }} spacing={6}>
        {hallList.map((hall) => (
          <DiningHallCard
            key={hall.id}
            hallId={hall.id}
            name={hall.name}
            logo={hall.logo}
          />
        ))}
      </SimpleGrid>
    </Box>
  );
}
