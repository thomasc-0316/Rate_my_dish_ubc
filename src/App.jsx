import { ChakraProvider, Box, extendTheme } from '@chakra-ui/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import Halls from './pages/Halls';
import DiningHallPage from './pages/DiningHallPage';
import DishPage from './pages/DishPage';
import LeaderboardPage from './pages/LeaderboardPage';
import Navbar from './components/Navbar';
import LoginPage from './pages/LoginPage';

const theme = extendTheme({
  fonts: {
    heading: '"Rubik", "Segoe UI", system-ui, -apple-system, sans-serif',
    body: '"Rubik", "Segoe UI", system-ui, -apple-system, sans-serif'
  },
  colors: {
    brand: {
      50: '#FFF7ED',
      100: '#FFEDD5',
      200: '#FED7AA',
      300: '#FDBA74',
      400: '#FB923C',
      500: '#F97316', // bright orange accent
      600: '#EA580C',
      700: '#C2410C',
      800: '#9A3412',
      900: '#7C2D12'
    },
    success: {
      500: '#16A34A'
    },
    warning: {
      500: '#F59E0B'
    },
    danger: {
      500: '#DC2626'
    },
    surface: {
      50: '#F5F5F7',
      100: '#EAEAEE'
    }
  },
  radii: {
    sm: '8px',
    md: '10px',
    lg: '12px',
    xl: '16px'
  },
  shadows: {
    sm: '0 4px 10px rgba(15, 23, 42, 0.06)',
    md: '0 8px 18px rgba(15, 23, 42, 0.08)',
    lg: '0 12px 28px rgba(15, 23, 42, 0.1)'
  },
  components: {
    Button: {
      baseStyle: {
        borderRadius: '999px',
        fontWeight: 'semibold'
      },
      defaultProps: {
        colorScheme: 'brand'
      },
      variants: {
        solid: {
          bg: 'brand.500',
          color: 'white',
          boxShadow: 'sm',
          _hover: { bg: 'brand.600', boxShadow: 'md' },
          _active: { bg: 'brand.700' }
        },
        ghost: {
          color: 'gray.700',
          _hover: { bg: 'surface.100' }
        }
      }
    },
    Badge: {
      baseStyle: {
        borderRadius: 'md',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
        fontSize: 'xs',
        fontWeight: 'bold',
        px: 2,
        py: 1
      }
    },
    Input: {
      baseStyle: {
        field: {
          borderRadius: 'md'
        }
      }
    },
    Textarea: {
      baseStyle: {
        borderRadius: 'md'
      }
    },
    Heading: {
      baseStyle: {
        textAlign: 'center'
      }
    }
  },
  styles: {
    global: {
      'html, body': {
        backgroundColor: 'surface.50',
        color: 'gray.900'
      },
      '#root': {
        minHeight: '100vh',
        backgroundColor: 'surface.50'
      },
      a: {
        color: 'brand.500',
        _hover: { color: 'brand.600' }
      }
    }
  }
});

export default function App() {
  return (
    <ChakraProvider theme={theme}>
      <BrowserRouter>
        <Navbar />
        <Box as="main" bg="transparent">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/halls" element={<Halls />} />
            <Route path="/hall/:hallId" element={<DiningHallPage />} />
            <Route path="/hall/:hallId/station/:stationId/dish/:dishId" element={<DishPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </Box>
      </BrowserRouter>
    </ChakraProvider>
  );
}
