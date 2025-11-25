import { Box, Heading, List, ListItem, Text } from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { listHalls } from '../api';

export default function Halls() {
  const [halls, setHalls] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await listHalls();
        setHalls(data);
      } catch (err) {
        console.error('Failed to load halls', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>
        Dining Halls
      </Heading>
      <Text mb={4}>Browse UBC dining halls.</Text>
      <List spacing={2}>
        {loading && <Text color="gray.600">Loading halls...</Text>}
        {!loading &&
          halls.map((hall) => (
            <ListItem key={hall.id}>
              <Link to={`/hall/${hall.slug}`}>{hall.name}</Link>
            </ListItem>
          ))}
      </List>
    </Box>
  );
}
