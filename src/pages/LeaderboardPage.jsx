import {
  Box,
  Heading,
  Table,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
  Text
} from '@chakra-ui/react';
import { Link, useNavigate } from 'react-router-dom';
import { getTopDishes } from '../data/mockMenu';

export default function LeaderboardPage() {
  const leaderboardEntries = getTopDishes();
  const navigate = useNavigate();

  function handleRowClick(entry) {
    navigate(`/hall/${entry.hallId}/station/${entry.stationId}/dish/${entry.dishId}`);
  }

  return (
    <Box p={{ base: 4, md: 10 }} maxW="900px" mx="auto">
      <Box display="flex" flexDir={{ base: 'column', md: 'row' }} justifyContent="space-between" mb={6}>
        <Heading size="lg">UBC Rate My Dish</Heading>
        <Text fontWeight="semibold" color="gray.600">
          Leaderboard
        </Text>
      </Box>
      <Text color="gray.600" mb={6}>
        {new Date().toLocaleDateString()} • Highest rated dishes across all halls
      </Text>

      <Box borderWidth="1px" borderRadius="lg" overflowX="auto">
        <Table variant="simple">
          <Thead bg="gray.50">
            <Tr>
              <Th textTransform="capitalize">Rank</Th>
              <Th textTransform="capitalize">Dish</Th>
              <Th textTransform="capitalize">Hall &amp; Station</Th>
              <Th textTransform="capitalize" isNumeric>
                Rating
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {leaderboardEntries.map((entry, index) => (
              <Tr
                key={entry.dishId}
                _hover={{ bg: 'purple.50', cursor: 'pointer' }}
                onClick={() => handleRowClick(entry)}
              >
                <Td fontWeight="bold">#{index + 1}</Td>
                <Td>
                  <Text as={Link} to={`/hall/${entry.hallId}/station/${entry.stationId}/dish/${entry.dishId}`} fontWeight="semibold" color="purple.700">
                    {entry.dishName}
                  </Text>
                </Td>
                <Td>
                  <Text fontSize="sm" color="gray.600">
                    {entry.hallName} • {entry.stationName}
                  </Text>
                </Td>
                <Td isNumeric fontWeight="bold">
                  {entry.rating.toFixed(1)}/10
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
