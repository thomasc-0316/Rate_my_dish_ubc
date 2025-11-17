import { Box, Heading } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function DiningHallCard({ hallId, name, imagePlaceholder, accentColor = 'gray.100' }) {
  const navigate = useNavigate();

  return (
    <Box
      borderWidth="1px"
      borderRadius="xl"
      p={4}
      transition="transform 0.2s ease, box-shadow 0.2s ease"
      _hover={{ transform: 'scale(1.05)', boxShadow: 'lg' }}
      onClick={() => navigate(`/hall/${hallId}`)}
      cursor="pointer"
    >
      <Box
        bg={accentColor}
        borderRadius="lg"
        height="180px"
        mb={4}
        display="flex"
        alignItems="center"
        justifyContent="center"
        color="gray.600"
        fontWeight="semibold"
        fontSize="lg"
      >
        {imagePlaceholder ?? 'Image'}
      </Box>
      <Heading size="md">{name}</Heading>
    </Box>
  );
}
