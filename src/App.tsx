// CHANGED: Updated to use routing for ticket system pages
import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Container, Flex, Heading, Button } from "@radix-ui/themes";
import { BrowserRouter, Routes, Route, Link, useLocation } from "react-router-dom";
import { MintTicket } from "./MintTicket";
import { MyTickets } from "./MyTickets";
import { Scanner } from "./Scanner";
import { CreateEvent } from "./CreateEvent";
import { WalrusUpload } from "./WalrusUpload";
import { MyEvents } from "./MyEvents";

function Navigation() {
  const location = useLocation();

  const navButtonStyle = (isActive: boolean) => ({
    background: isActive
      ? 'var(--suicket-gradient-primary)'
      : 'var(--suicket-bg-primary)',
    color: isActive ? 'white' : 'var(--suicket-text-primary)',
    border: isActive ? 'none' : '1px solid var(--suicket-border-medium)',
    boxShadow: isActive ? 'var(--suicket-shadow-blue)' : 'none',
    transition: 'all var(--suicket-transition-base)',
    fontWeight: isActive ? '600' : '500',
  });

  return (
    <Flex gap="2">
      <Link to="/" style={{ textDecoration: 'none' }}>
        <Button
          variant="soft"
          size="2"
          style={navButtonStyle(location.pathname === "/")}
        >
          Buy Tickets
        </Button>
      </Link>
      <Link to="/my-tickets" style={{ textDecoration: 'none' }}>
        <Button
          variant="soft"
          size="2"
          style={navButtonStyle(location.pathname === "/my-tickets")}
        >
          My Tickets
        </Button>
      </Link>
      <Link to="/create-event" style={{ textDecoration: 'none' }}>
        <Button
          variant="soft"
          size="2"
          style={navButtonStyle(location.pathname === "/create-event")}
        >
          Create Event
        </Button>
      </Link>
      <Link to="/my-events" style={{ textDecoration: 'none' }}>
        <Button
          variant="soft"
          size="2"
          style={navButtonStyle(location.pathname === "/my-events")}
        >
          My Events
        </Button>
      </Link>
    </Flex>
  );
}

function AppContent() {
  return (
    <>
      <Flex
        position="sticky"
        px="6"
        py="4"
        justify="between"
        align="center"
        style={{
          background: 'linear-gradient(to right, rgba(14, 165, 233, 0.05), rgba(168, 85, 247, 0.05))',
          borderBottom: "2px solid var(--suicket-primary-200)",
          backdropFilter: "blur(10px)",
          boxShadow: "var(--suicket-shadow-sm)",
        }}
      >
        <Box style={{ flex: 1 }}>
          <Heading
            size="7"
            style={{
              background: 'var(--suicket-gradient-ticket)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontWeight: '700',
              letterSpacing: '-0.02em',
            }}
          >
            Suicket
          </Heading>
        </Box>

        <Box style={{ flex: 1, display: "flex", justifyContent: "center" }}>
          <Navigation />
        </Box>

        <Box style={{ flex: 1, display: "flex", justifyContent: "flex-end" }}>
          <ConnectButton />
        </Box>
      </Flex>
      <Container>
        <Container
          mt="5"
          pt="2"
          px="4"
          style={{
            background: "var(--suicket-bg-secondary)",
            minHeight: "calc(100vh - 100px)",
            borderRadius: "var(--suicket-radius-xl)",
          }}
        >
          <Routes>
            <Route path="/" element={<MintTicket />} />
            <Route path="/my-tickets" element={<MyTickets />} />
            <Route path="/scanner" element={<Scanner />} />
            <Route path="/create-event" element={<CreateEvent />} />
            <Route path="/my-events" element={<MyEvents />} />
            <Route path="/walrus" element={<WalrusUpload />} />
          </Routes>
        </Container>
      </Container>
    </>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}

export default App;
