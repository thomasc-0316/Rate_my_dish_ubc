import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Badge,
  Box,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  FormControl,
  FormLabel,
  Heading,
  Image,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  VStack,
  HStack,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import {
  addComment,
  getDish,
  getDishStats,
  listComments,
  listHalls,
  listStations
} from '../api';
import CommentItem from '../components/CommentItem';

export default function DishPage() {
  const { hallId = '', stationId = '', dishId = '' } = useParams();
  const [dish, setDish] = useState(null);
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState('');
  const [stats, setStats] = useState({ avg: 0, count: 0 });
  const [hallName, setHallName] = useState('');
  const [stationName, setStationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      if (!dishId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError('');
        setComments([]);

        const [halls, stationRows, dishRow, dishStats, dishComments] = await Promise.all([
          listHalls(),
          hallId ? listStations(hallId) : Promise.resolve([]),
          getDish(dishId),
          getDishStats(dishId),
          listComments(dishId)
        ]);

        setHallName(halls.find((h) => h.slug === hallId)?.name ?? '');
        const matchedStation = stationRows.find((st) => String(st.id) === String(stationId));
        setStationName(matchedStation?.name ?? '');

        setDish(dishRow);
        setStats(dishStats);
        setComments(dishComments);
      } catch (err) {
        console.error('Failed to load dish', err);
        setError('Could not load dish details right now.');
      } finally {
        setLoading(false);
      }
    })();
  }, [hallId, stationId, dishId]);

  async function handleComment(event) {
    event.preventDefault();
    if (!dish || !body.trim()) return;
    try {
      setError('');
      await addComment(dish.id, body.trim());
      setComments((prev) => [
        {
          id: `local-${Date.now()}`,
          user_id: null,
          dish_id: dish.id,
          body: body.trim(),
          created_at: new Date().toISOString()
        },
        ...prev
      ]);
      setBody('');
    } catch (err) {
      console.error('Failed to add comment', err);
      setError('Please sign in to post comments.');
    }
  }

  const ratingText =
    stats.count > 0 ? `${stats.avg.toFixed(1)} (${stats.count} rating${stats.count === 1 ? '' : 's'})` : 'No ratings yet';

  if (loading) {
    return (
      <Box p={6}>
        <Text>Loading dish...</Text>
      </Box>
    );
  }

  if (!dish) {
    return (
      <Box p={{ base: 4, md: 10 }} maxW="1100px" mx="auto">
        <Heading size="lg" mb={2}>
          UBC Rate My Dish
        </Heading>
        <Text color="gray.500">Dish not found.</Text>
        <Button mt={4} as={Link} to="/" variant="ghost">
          {'<- Back home'}
        </Button>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 10 }} maxW="1100px" mx="auto">
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}

      <Breadcrumb mb={4} fontSize="sm">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        {hallId && (
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to={`/hall/${hallId}`}>
              {hallName || hallId}
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        {stationId && (
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to={`/hall/${hallId}`}>
              {stationName || 'Station'}
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        <BreadcrumbItem isCurrentPage>
          <BreadcrumbLink>{dish.name}</BreadcrumbLink>
        </BreadcrumbItem>
      </Breadcrumb>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={8}>
        <Box>
          <Image
            src={dish.image || 'https://placehold.co/600x400?text=Dish+Image'}
            alt={dish.name}
            borderRadius="xl"
            objectFit="cover"
            w="100%"
            h="320px"
            mb={6}
            fallbackSrc="https://placehold.co/600x400?text=Dish+Image"
          />
          <Heading size="xl" mb={2}>
            {dish.name}
          </Heading>
          <Text color="gray.600" mb={2}>
            {stationName || 'Station'} - {hallName || 'Hall'}
          </Text>
          <Text fontSize="lg" fontWeight="bold" color="purple.600" mb={1}>
            {ratingText}
          </Text>
          <Text color="gray.800">{dish.description || 'No description yet.'}</Text>
        </Box>

        <Box>
          <Heading size="md" mb={4}>
            Comments
          </Heading>
          <Box borderWidth="1px" borderRadius="lg" p={4} mb={4} maxH="320px" overflowY="auto">
            {comments.length === 0 ? (
              <Text color="gray.500">No comments yet. Be the first to share!</Text>
            ) : (
              <VStack align="stretch" spacing={3}>
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    username={comment.user_id || 'Anonymous'}
                    timestamp={comment.created_at || 'Just now'}
                    text={comment.body}
                  />
                ))}
              </VStack>
            )}
          </Box>

          <Box borderWidth="1px" borderRadius="lg" p={4} bg="gray.50">
            <Heading size="sm" mb={3}>
              Share a comment
            </Heading>
            <form onSubmit={handleComment}>
              <FormControl>
                <FormLabel srOnly>Comment</FormLabel>
                <Textarea
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                  placeholder="Tell others what you thought!"
                  rows={4}
                />
              </FormControl>
              <Button type="submit" mt={3} colorScheme="purple" isDisabled={!body.trim()}>
                Post Comment
              </Button>
            </form>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
