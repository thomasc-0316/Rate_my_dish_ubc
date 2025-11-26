import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
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
  Text,
  Textarea,
  VStack,
  HStack,
  Alert,
  AlertIcon
} from '@chakra-ui/react';
import {
  addComment,
  addOrUpdateRating,
  getDish,
  getDishStats,
  listComments,
  listHalls,
  listStations
} from '../api';
import { useSupabaseAuth } from '../hooks/useSupabaseAuth';
import CommentItem from '../components/CommentItem';

export default function DishPage() {
  const { hallId = '', stationId = '', dishId = '' } = useParams();
  const { user } = useSupabaseAuth();
  const [dish, setDish] = useState(null);
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState('');
  const [stats, setStats] = useState({ avg: 0, count: 0 });
  const [hallName, setHallName] = useState('');
  const [stationName, setStationName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [ratingValue, setRatingValue] = useState(null);
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [ratingMessage, setRatingMessage] = useState('');
  const formatName = (name) =>
    typeof name === 'string' ? name.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase()) : '';

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
  const displayName = formatName(dish?.name);
  const ratingColor =
    stats.count === 0
      ? 'gray.600'
      : stats.avg >= 4
        ? 'green.500'
        : stats.avg >= 3
          ? 'yellow.500'
          : 'red.500';

  async function handleRating() {
    if (!dish || !ratingValue) return;
    if (!user) {
      setError('Please sign in to rate dishes.');
      return;
    }
    try {
      setRatingSubmitting(true);
      setError('');
      setRatingMessage('');
      await addOrUpdateRating(dish.id, ratingValue);
      const updatedStats = await getDishStats(dish.id);
      setStats(updatedStats);
      setRatingValue(null);
      setRatingMessage('Thanks for rating!');
    } catch (err) {
      console.error('Failed to submit rating', err);
      setError('Could not submit rating right now.');
    } finally {
      setRatingSubmitting(false);
    }
  }

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
          <BreadcrumbLink>{displayName}</BreadcrumbLink>
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
            {displayName}
          </Heading>
          <Text color="gray.600" mb={2}>
            {stationName || 'Station'} - {hallName || 'Hall'}
          </Text>
          <Text fontSize="lg" fontWeight="bold" color={ratingColor} mb={1}>
            {ratingText}
          </Text>
          <Text color="gray.800">{dish.description || 'No description yet.'}</Text>
          <Box mt={5}>
            <Text fontWeight="semibold" mb={2}>
              Rate this dish
            </Text>
            <HStack spacing={2} mb={2}>
              {[1, 2, 3, 4, 5].map((score) => (
                <Button
                  key={score}
                  size="sm"
                  variant={ratingValue === score ? 'solid' : 'outline'}
                  colorScheme="brand"
                  onClick={() => setRatingValue(score)}
                >
                  {score}
                </Button>
              ))}
            </HStack>
            <Button
              size="sm"
              colorScheme="brand"
              onClick={handleRating}
              isDisabled={!ratingValue}
              isLoading={ratingSubmitting}
            >
              Submit rating
            </Button>
            {ratingMessage ? (
              <Text color="green.600" fontSize="sm" mt={2}>
                {ratingMessage}
              </Text>
            ) : null}
            {!user ? (
              <Text color="gray.600" fontSize="sm" mt={2}>
                Sign in to submit a rating.
              </Text>
            ) : null}
          </Box>
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
              <Button type="submit" mt={3} colorScheme="brand" isDisabled={!body.trim()}>
                Post Comment
              </Button>
            </form>
          </Box>
        </Box>
      </SimpleGrid>
    </Box>
  );
}
