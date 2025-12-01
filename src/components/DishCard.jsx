import { Box, Heading, Text, Image, Center } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useDishImage } from '../hooks/useDishImage';

export default function DishCard({ dish, stats }) {
  const imageUrl = useDishImage(dish);

  return (
    <Box as={Link} to={`/dishes/${dish.id}`} borderWidth="1px" borderRadius="md" p={4} _hover={{ boxShadow: 'lg' }} transition="all 0.2s">
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={dish.name}
          borderRadius="md"
          objectFit="cover"
          w="100%"
          h="200px"
          mb={3}
          fallbackSrc="https://placehold.co/400x200?text=Dish+Image"
        />
      )}
      <Heading size="md">{dish.name}</Heading>
      <Text fontSize="sm" color="gray.600" position={Center}>
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
