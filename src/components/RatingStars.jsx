import { HStack, IconButton } from '@chakra-ui/react';
import { StarIcon } from '@chakra-ui/icons';

export default function RatingStars({ value, onChange }) {
  return (
    <HStack>
      {[1, 2, 3, 4, 5].map((score) => (
        <IconButton
          key={score}
          aria-label={`Rate ${score}`}
          icon={<StarIcon />}
          variant={score <= value ? 'solid' : 'outline'}
          onClick={() => onChange(score)}
        />
      ))}
    </HStack>
  );
}
