import { Badge, Box, Flex, Heading, HStack, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';

export default function DishListItem({ dish, hallId, stationId }) {
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
        <Heading size="sm">{dish.name}</Heading>
        <HStack spacing={2} mt={2}>
          {dish.tags?.map((tag) => (
            <Badge key={tag} colorScheme="purple">
              {tag}
            </Badge>
          ))}
        </HStack>
      </Box>
      <Text fontWeight="semibold">{dish.rating.toFixed(1)}/10</Text>
    </Flex>
  );
}
