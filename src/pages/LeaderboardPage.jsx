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
import { useEffect, useState } from 'react';
import { listLeaderboard } from '../api';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      try {
        const data = await listLeaderboard();
        setEntries(data);
      } catch (err) {
        console.error('Failed to load leaderboard', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Box p={{ base: 4, md: 10 }} maxW="900px" mx="auto">
      <Box display="flex" flexDir={{ base: 'column', md: 'row' }} justifyContent="space-between" mb={6}>
        <Heading size="2xl">Leaderboard</Heading>
      </Box>
      <Text color="gray.600" mb={6}>
        {new Date().toLocaleDateString()} - Highest rated dishes across all halls
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
            {loading && (
              <Tr>
                <Td colSpan={4}>
                  <Text color="gray.600">Loading leaderboard...</Text>
                </Td>
              </Tr>
            )}
            {!loading &&
              entries.map((entry, index) => (
                <Tr
                  key={entry.dishId}
                  _hover={{ bg: entry.hallSlug ? 'brand.50' : undefined, cursor: entry.hallSlug ? 'pointer' : 'default' }}
                  onClick={() =>
                    entry.hallSlug &&
                    entry.stationId &&
                    navigate(`/hall/${entry.hallSlug}/station/${entry.stationId}/dish/${entry.dishId}`)
                  }
                >
                  <Td fontWeight="bold">#{index + 1}</Td>
                  <Td>
                    <Text
                      as={entry.hallSlug ? Link : 'span'}
                      to={
                        entry.hallSlug
                          ? `/hall/${entry.hallSlug}/station/${entry.stationId}/dish/${entry.dishId}`
                          : undefined
                      }
                      fontWeight="semibold"
                      color="brand.600"
                    >
                      {typeof entry.dishName === 'string'
                        ? entry.dishName.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase())
                        : entry.dishName}
                    </Text>
                  </Td>
                  <Td>
                    <Text fontSize="sm" color="gray.600">
                      {entry.hallName || 'Hall'} - {entry.stationName || 'Station'}
                    </Text>
                  </Td>
                  <Td isNumeric fontWeight="bold">
                    {entry.count > 0 ? `${entry.avg.toFixed(1)}/10` : 'No ratings'}
                  </Td>
                </Tr>
              ))}
          </Tbody>
        </Table>
      </Box>
    </Box>
  );
}
