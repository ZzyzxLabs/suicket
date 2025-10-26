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
import { useState } from "react";
import { Menu, X } from "lucide-react";

function Navigation() {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navLinks = [
    { to: "/", label: "Buy Tickets" },
    { to: "/my-tickets", label: "My Tickets" },
    { to: "/create-event", label: "Create Event" },
    { to: "/my-events", label: "My Events" },
  ];

  return (
    <>
      {/* Desktop Navigation */}
      <Flex gap="2" className="suicket-nav-desktop">
        {navLinks.map((link) => (
          <Link key={link.to} to={link.to} style={{ textDecoration: 'none' }}>
            <Button
              variant="soft"
              size="2"
              style={navButtonStyle(location.pathname === link.to)}
            >
              {link.label}
            </Button>
          </Link>
        ))}
      </Flex>

      {/* Mobile Navigation Toggle */}
      <div className="suicket-nav-mobile-toggle">
        <Button
          variant="soft"
          size="2"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          style={{
            background: 'var(--suicket-bg-primary)',
            border: '1px solid var(--suicket-border-medium)',
          }}
        >
          {isMobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </Button>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="suicket-nav-mobile-menu">
          <Flex direction="column" gap="2" p="4">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                style={{ textDecoration: 'none' }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Button
                  variant="soft"
                  size="3"
                  style={{
                    ...navButtonStyle(location.pathname === link.to),
                    width: '100%',
                    justifyContent: 'flex-start',
                  }}
                >
                  {link.label}
                </Button>
              </Link>
            ))}
          </Flex>
        </div>
      )}
    </>
  );
}

function AppContent() {
  return (
    <>
      <Flex
        position="sticky"
        px={{ initial: "4", md: "6" }}
        py={{ initial: "3", md: "4" }}
        justify="between"
        align="center"
        style={{
          background: 'linear-gradient(to right, rgba(14, 165, 233, 0.05), rgba(168, 85, 247, 0.05))',
          borderBottom: "2px solid var(--suicket-primary-200)",
          backdropFilter: "blur(10px)",
          boxShadow: "var(--suicket-shadow-sm)",
          position: 'relative',
        }}
      >
        <Box style={{ flex: '0 0 auto', minWidth: '140px' }}>
          <Heading
            size={{ initial: "5", md: "7" }}
            style={{
              background: 'var(--suicket-primary-600)',
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

        <Box
          className="suicket-nav-container"
          style={{
            flex: '1 1 auto',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Navigation />
        </Box>

        <Box
          className="suicket-connect-button"
          style={{
            flex: '0 0 auto',
            minWidth: '140px',
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
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
