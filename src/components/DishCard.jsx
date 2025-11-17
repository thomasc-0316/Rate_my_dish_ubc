import { Box, Heading, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export default function DishCard({ dish, stats }) {
  return (
    <Box as={Link} to={`/dishes/${dish.id}`} borderWidth="1px" borderRadius="md" p={4}>
      <Heading size="md">{dish.name}</Heading>
      <Text fontSize="sm" color="gray.600">
        {dish.description || 'No description yet.'}
      </Text>
      {stats && (
        <Text mt={2}>
          Avg {stats.avg.toFixed(1)} • {stats.count} ratings
        </Text>
      )}
      <Text mt={2} fontSize="sm" color="gray.500">
        TODO: show hall and station labels.
      </Text>
    </Box>
  );
}
