import { Box, Heading, Image } from '@chakra-ui/react';
import { useNavigate } from 'react-router-dom';

export default function DiningHallCard({ hallId, name, logo, accentColor = 'white.100' }) {
  const navigate = useNavigate();

  return (
    <Box
      borderWidth="1px"
      borderColor="gray.200"
      borderRadius="lg"
      p={4}
      bg="surface.50"
      boxShadow="sm"
      transition="transform 0.2s ease, box-shadow 0.2s ease"
      _hover={{ transform: 'translateY(-3px)', boxShadow: 'md' }}
      onClick={() => navigate(`/hall/${hallId}`)}
      cursor="pointer"
    >
      <Box
        bg={accentColor}
        borderRadius="lg"
        height="300px"
        mb={4}
        display="flex"
        alignItems="center"
        justifyContent="center"
        overflow="hidden"
      >
        {logo ? (
          <Image src={logo} alt={`${name} logo`} maxH="100%" objectFit="contain" />
        ) : (
          <Box color="gray.600" fontWeight="semibold" fontSize="lg">
            Image
          </Box>
        )}
      </Box>
    </Box>
  );
}
