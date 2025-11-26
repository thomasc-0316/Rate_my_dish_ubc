import { Badge, Box, Flex, Heading, HStack, Text, Image } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { useDishImage } from '../hooks/useDishImage';

export default function DishListItem({ dish, hallId, stationId }) {
  const rating = typeof dish.rating === 'number' ? dish.rating : null;
  const imageUrl = useDishImage(dish);
  const formatName = (name) =>
    typeof name === 'string' ? name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : '';
  const displayName = formatName(dish.name);
  const ratingColor =
    rating == null
      ? 'gray.500'
      : rating >= 4
        ? 'green.500'
        : rating >= 3
          ? 'yellow.500'
          : 'red.500';

  return (
    <Flex
      as={Link}
      to={`/hall/${hallId}/station/${stationId}/dish/${dish.id}`}
      align="center"
      gap={4}
      p={3}
      borderWidth="1px"
      borderRadius="md"
      bg="white"
      _hover={{ boxShadow: 'md' }}
    >
      {imageUrl && (
        <Image
          src={imageUrl}
          alt={dish.name}
          borderRadius="md"
          objectFit="cover"
          w="80px"
          h="80px"
          flexShrink={0}
          fallbackSrc="https://placehold.co/80x80?text=Dish"
        />
      )}
      <Box flex="1">
        <Heading size="sm">{dish.name}</Heading>
      <Box>
        <Heading size="sm">{displayName}</Heading>
        {dish.description && (
          <Text fontSize="sm" color="gray.600" mt={1} noOfLines={2}>
            {dish.description}
          </Text>
        )}
        <HStack spacing={2} mt={2}>
          {dish.tags?.map((tag) => (
            <Badge key={tag} colorScheme="brand">
              {tag}
            </Badge>
          ))}
        </HStack>
      </Box>
      <Text fontWeight="semibold" color={ratingColor}>
        {rating ? `${rating.toFixed(1)}/5` : 'No ratings yet'}
      </Text>
    </Flex>
  );
}
