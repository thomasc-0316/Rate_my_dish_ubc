import { Badge, Box, Flex, Heading, HStack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export default function DishListItem({ dish, hallId, stationId }) {
  const rating = typeof dish.rating === 'number' ? dish.rating : null;
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
      justify="space-between"
      p={3}
      borderWidth="1px"
      borderRadius="md"
      bg="white"
      _hover={{ boxShadow: 'md' }}
    >
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
