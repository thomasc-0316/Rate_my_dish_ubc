import { Box, Heading, List, ListItem, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { hallList } from '../data/mockMenu';

export default function Halls() {
  return (
    <Box p={6}>
      <Heading size="lg" mb={4}>
        Dining Halls
      </Heading>
      <Text mb={4}>Placeholder data for Feast, Open Kitchen, and Gather.</Text>
      <List spacing={2}>
        {hallList.map((hall) => (
          <ListItem key={hall.id}>
            <Link to={`/hall/${hall.id}`}>{hall.name}</Link>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}
