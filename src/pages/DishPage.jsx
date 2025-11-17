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
  HStack
} from '@chakra-ui/react';
import { getDish, getHall, getStation } from '../data/mockMenu';
import CommentItem from '../components/CommentItem';

export default function DishPage() {
  const { hallId = '', stationId = '', dishId = '' } = useParams();
  const [dish, setDish] = useState(null);
  const [comments, setComments] = useState([]);
  const [body, setBody] = useState('');
  const [attemptedLoad, setAttemptedLoad] = useState(false);

  useEffect(() => {
    if (!hallId || !stationId || !dishId) {
      setDish(null);
      setComments([]);
      setAttemptedLoad(true);
      return;
    }
    const nextDish = getDish(hallId, stationId, dishId);
    setDish(nextDish ?? null);
    setComments(nextDish?.comments ?? []);
    setAttemptedLoad(true);
  }, [hallId, stationId, dishId]);

  function handleComment(event) {
    event.preventDefault();
    if (!dish || !body.trim()) return;
    const newComment = {
      id: `${dish.id}-comment-${Date.now()}`,
      author: 'Anonymous',
      timestamp: 'Just now',
      body: body.trim()
    };
    setComments((prev) => [newComment, ...prev]);
    setBody('');
  }

  const hall = hallId ? getHall(hallId) : null;
  const station = hall && stationId ? getStation(hallId, stationId) : null;

  if (attemptedLoad && (!dish || !hall || !station)) {
    return (
      <Box p={{ base: 4, md: 10 }} maxW="1100px" mx="auto">
        <Heading size="lg" mb={2}>
          UBC Rate My Dish
        </Heading>
        <Text color="gray.500">Dish not found.</Text>
        <Button mt={4} as={Link} to="/" variant="ghost">
          ← Back home
        </Button>
      </Box>
    );
  }

  if (!dish || !hall || !station) {
    return (
      <Box p={6}>
        <Text>Loading dish...</Text>
      </Box>
    );
  }

  return (
    <Box p={{ base: 4, md: 10 }} maxW="1100px" mx="auto">
      <Breadcrumb mb={4} fontSize="sm">
        <BreadcrumbItem>
          <BreadcrumbLink as={Link} to="/">
            Home
          </BreadcrumbLink>
        </BreadcrumbItem>
        {hall && (
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to={`/hall/${hall.id}`}>
              {hall.name}
            </BreadcrumbLink>
          </BreadcrumbItem>
        )}
        {station && (
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to={`/hall/${hall.id}`}>
              {station.name}
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
            src={dish.image}
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
            {station?.name} – {hall?.name}
          </Text>
          <Text fontSize="2xl" fontWeight="bold" color="purple.600" mb={1}>
            {dish.rating.toFixed(1)}/10
          </Text>
          <Text color="gray.500" mb={4}>
            Part of the {hall.name} menu
          </Text>
          <Stack direction="row" spacing={2} mb={4}>
            {dish.tags.map((tag) => (
              <Badge key={tag} colorScheme="purple">
                {tag}
              </Badge>
            ))}
          </Stack>
          <Text color="gray.800">{dish.description}</Text>
        </Box>

        <Box>
          <Heading size="md" mb={4}>
            COMMENTS
          </Heading>
          <Box borderWidth="1px" borderRadius="lg" p={4} mb={4} maxH="320px" overflowY="auto">
            {comments.length === 0 ? (
              <Text color="gray.500">No comments yet. Be the first to share!</Text>
            ) : (
              <VStack align="stretch" spacing={3}>
                {comments.map((comment) => (
                  <CommentItem
                    key={comment.id}
                    username={comment.author}
                    timestamp={comment.timestamp}
                    text={comment.body}
                  />
                ))}
              </VStack>
            )}
          </Box>
          <HStack justify="center" spacing={2} mb={5} color="gray.600">
            <Text>&lt;</Text>
            {[1, 2, 3, 4].map((page) => (
              <Box
                key={page}
                px={2}
                py={1}
                borderWidth="1px"
                borderRadius="md"
                fontSize="sm"
                minW="32px"
                textAlign="center"
              >
                {page}
              </Box>
            ))}
            <Text>…</Text>
            <Text>&gt;</Text>
          </HStack>

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
                  placeholder="Front-end only for now… tell others what you thought!"
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
