import {
  AccordionButton,
  AccordionIcon,
  AccordionItem,
  AccordionPanel,
  Box,
  Flex,
  Heading,
  Stack,
  Text
} from '@chakra-ui/react';
import DishListItem from './DishListItem';

export default function StationAccordionItem({ station, hallId }) {
  const dishesForStation = station?.dishes ?? [];

  return (
    <AccordionItem border="none" mb={3}>
      <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
        <AccordionButton>
          <Flex flex="1" align="center" justify="space-between">
            <Heading size="md">{station.name}</Heading>
            <AccordionIcon />
          </Flex>
        </AccordionButton>
        <AccordionPanel bg="gray.50">
          {dishesForStation.length === 0 ? (
            <Text color="gray.500" fontStyle="italic">
              No dishes available at this station.
            </Text>
          ) : (
            <Stack spacing={3}>
              {dishesForStation.map((dish) => (
                <DishListItem key={dish.id} dish={dish} hallId={hallId} stationId={station.id} />
              ))}
            </Stack>
          )}
        </AccordionPanel>
      </Box>
    </AccordionItem>
  );
}
