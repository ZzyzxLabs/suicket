// CHANGED: Complete NFT ticket implementation with minting, usage tracking, and transfer
// This module implements a ticketing system for CalHacks 12.0 with 50 ticket supply cap

module counter::suicket {
    use sui::transfer;
    use sui::object::{Self, UID};
    use sui::tx_context::{Self, TxContext};

    // ====== Error Codes ======
    const EMaxSupplyReached: u64 = 0x1001;  // Thrown when trying to mint beyond 50 tickets
    const ETicketAlreadyUsed: u64 = 0x1002;  // Thrown when trying to use an already-used ticket
    const ENotOwner: u64 = 0x1003;  // Thrown when non-owner tries to use ticket

    // ====== Constants ======
    const MAX_SUPPLY: u64 = 50;  // Maximum number of tickets for CalHacks
    const STATUS_VALID: u8 = 0;  // Ticket is valid and unused
    const STATUS_USED: u8 = 1;   // Ticket has been used

    // ====== Structs ======

    /// Shared counter object to track total minted tickets
    /// This is shared so anyone can read the count but only mint function can modify it
    public struct EventCounter has key {
        id: UID,
        minted: u64,  // Number of tickets minted so far
    }

    /// NFT ticket with status tracking
    /// Each ticket is a unique object owned by an address
    public struct Ticket has key, store {
        id: UID,
        ticket_number: u64,  // Sequential ticket number (1-50)
        owner: address,      // Current owner of the ticket
        status: u8,          // 0 = Valid, 1 = Used
    }

    // ====== Functions ======

    /// Initialize the event counter (called once during publish)
    /// Creates a shared EventCounter object starting at 0
    fun init(ctx: &mut TxContext) {
        let counter = EventCounter {
            id: object::new(ctx),
            minted: 0,
        };
        transfer::share_object(counter);
    }

    /// Mint a new ticket NFT
    /// Checks supply cap before minting and assigns sequential ticket number
    ///
    /// # Arguments
    /// * `counter` - Shared EventCounter to track minted count
    /// * `ctx` - Transaction context for sender address
    ///
    /// # Aborts
    /// * `EMaxSupplyReached` - If already minted 50 tickets
    public entry fun mint_ticket(counter: &mut EventCounter, ctx: &mut TxContext) {
        // Check if we've reached max supply
        assert!(counter.minted < MAX_SUPPLY, EMaxSupplyReached);

        // Increment counter and get ticket number
        counter.minted = counter.minted + 1;
        let ticket_number = counter.minted;

        // Get sender address
        let sender = tx_context::sender(ctx);

        // Create new ticket NFT
        let ticket = Ticket {
            id: object::new(ctx),
            ticket_number,
            owner: sender,
            status: STATUS_VALID,
        };

        // Transfer ticket to sender
        transfer::transfer(ticket, sender);
    }

    /// Mark a ticket as used (for check-in)
    /// Only the ticket owner can mark it as used
    ///
    /// # Arguments
    /// * `ticket` - Mutable reference to ticket to mark as used
    /// * `ctx` - Transaction context for sender verification
    ///
    /// # Aborts
    /// * `ENotOwner` - If sender is not the ticket owner
    /// * `ETicketAlreadyUsed` - If ticket status is already USED
    public entry fun use_ticket(ticket: &mut Ticket, ctx: &mut TxContext) {
        let sender = tx_context::sender(ctx);

        // Verify sender is the ticket owner
        assert!(ticket.owner == sender, ENotOwner);

        // Verify ticket hasn't been used already
        assert!(ticket.status == STATUS_VALID, ETicketAlreadyUsed);

        // Mark ticket as used
        ticket.status = STATUS_USED;
    }

    /// Transfer ticket to another address
    /// Updates the owner field and transfers ownership
    ///
    /// # Arguments
    /// * `ticket` - Ticket object to transfer
    /// * `recipient` - Address to receive the ticket
    /// * `ctx` - Transaction context
    public entry fun transfer_ticket(mut ticket: Ticket, recipient: address, _ctx: &mut TxContext) {
        // Update owner field to new recipient
        ticket.owner = recipient;

        // Transfer the ticket object
        transfer::transfer(ticket, recipient);
    }

    // ====== View Functions ======

    /// Get the current minted count
    public fun get_minted_count(counter: &EventCounter): u64 {
        counter.minted
    }

    /// Get ticket number
    public fun get_ticket_number(ticket: &Ticket): u64 {
        ticket.ticket_number
    }

    /// Get ticket owner
    public fun get_owner(ticket: &Ticket): address {
        ticket.owner
    }

    /// Get ticket status
    public fun get_status(ticket: &Ticket): u8 {
        ticket.status
    }

    // ====== Tests ======

    #[test_only]
    use sui::test_scenario;

    #[test]
    fun test_mint_within_supply() {
        let admin = @0xAD;
        let user = @0x1;

        let mut scenario = test_scenario::begin(admin);

        // Init creates shared counter
        {
            init(test_scenario::ctx(&mut scenario));
        };

        // Mint a ticket as user
        test_scenario::next_tx(&mut scenario, user);
        {
            let mut counter = test_scenario::take_shared<EventCounter>(&scenario);
            mint_ticket(&mut counter, test_scenario::ctx(&mut scenario));
            assert!(counter.minted == 1, 0);
            test_scenario::return_shared(counter);
        };

        // Verify ticket was received
        test_scenario::next_tx(&mut scenario, user);
        {
            let ticket = test_scenario::take_from_sender<Ticket>(&scenario);
            assert!(ticket.ticket_number == 1, 1);
            assert!(ticket.owner == user, 2);
            assert!(ticket.status == STATUS_VALID, 3);
            test_scenario::return_to_sender(&scenario, ticket);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = EMaxSupplyReached)]
    fun test_exceed_max_supply() {
        let admin = @0xAD;
        let user = @0x1;

        let mut scenario = test_scenario::begin(admin);

        // Init
        {
            init(test_scenario::ctx(&mut scenario));
        };

        // Mint 51 tickets (should fail on 51st)
        test_scenario::next_tx(&mut scenario, user);
        {
            let mut counter = test_scenario::take_shared<EventCounter>(&scenario);
            let mut i = 0;
            while (i < 51) {
                mint_ticket(&mut counter, test_scenario::ctx(&mut scenario));
                i = i + 1;
            };
            test_scenario::return_shared(counter);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_use_ticket_success() {
        let admin = @0xAD;
        let user = @0x1;

        let mut scenario = test_scenario::begin(admin);

        // Init and mint
        {
            init(test_scenario::ctx(&mut scenario));
        };

        test_scenario::next_tx(&mut scenario, user);
        {
            let mut counter = test_scenario::take_shared<EventCounter>(&scenario);
            mint_ticket(&mut counter, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(counter);
        };

        // Use ticket
        test_scenario::next_tx(&mut scenario, user);
        {
            let mut ticket = test_scenario::take_from_sender<Ticket>(&scenario);
            use_ticket(&mut ticket, test_scenario::ctx(&mut scenario));
            assert!(ticket.status == STATUS_USED, 0);
            test_scenario::return_to_sender(&scenario, ticket);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ETicketAlreadyUsed)]
    fun test_prevent_double_use() {
        let admin = @0xAD;
        let user = @0x1;

        let mut scenario = test_scenario::begin(admin);

        // Init and mint
        {
            init(test_scenario::ctx(&mut scenario));
        };

        test_scenario::next_tx(&mut scenario, user);
        {
            let mut counter = test_scenario::take_shared<EventCounter>(&scenario);
            mint_ticket(&mut counter, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(counter);
        };

        // Use ticket first time
        test_scenario::next_tx(&mut scenario, user);
        {
            let mut ticket = test_scenario::take_from_sender<Ticket>(&scenario);
            use_ticket(&mut ticket, test_scenario::ctx(&mut scenario));
            test_scenario::return_to_sender(&scenario, ticket);
        };

        // Try to use again (should fail)
        test_scenario::next_tx(&mut scenario, user);
        {
            let mut ticket = test_scenario::take_from_sender<Ticket>(&scenario);
            use_ticket(&mut ticket, test_scenario::ctx(&mut scenario));
            test_scenario::return_to_sender(&scenario, ticket);
        };

        test_scenario::end(scenario);
    }

    #[test]
    #[expected_failure(abort_code = ENotOwner)]
    fun test_only_owner_can_use() {
        let admin = @0xAD;
        let user = @0x1;
        let attacker = @0x2;

        let mut scenario = test_scenario::begin(admin);

        // Init and mint to user
        {
            init(test_scenario::ctx(&mut scenario));
        };

        test_scenario::next_tx(&mut scenario, user);
        {
            let mut counter = test_scenario::take_shared<EventCounter>(&scenario);
            mint_ticket(&mut counter, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(counter);
        };

        // Attacker tries to use user's ticket (should fail)
        test_scenario::next_tx(&mut scenario, attacker);
        {
            let mut ticket = test_scenario::take_from_address<Ticket>(&scenario, user);
            use_ticket(&mut ticket, test_scenario::ctx(&mut scenario));
            test_scenario::return_to_address(user, ticket);
        };

        test_scenario::end(scenario);
    }

    #[test]
    fun test_transfer_ticket() {
        let admin = @0xAD;
        let user = @0x1;
        let recipient = @0x2;

        let mut scenario = test_scenario::begin(admin);

        // Init and mint to user
        {
            init(test_scenario::ctx(&mut scenario));
        };

        test_scenario::next_tx(&mut scenario, user);
        {
            let mut counter = test_scenario::take_shared<EventCounter>(&scenario);
            mint_ticket(&mut counter, test_scenario::ctx(&mut scenario));
            test_scenario::return_shared(counter);
        };

        // Transfer ticket to recipient
        test_scenario::next_tx(&mut scenario, user);
        {
            let ticket = test_scenario::take_from_sender<Ticket>(&scenario);
            transfer_ticket(ticket, recipient, test_scenario::ctx(&mut scenario));
        };

        // Verify recipient received ticket with updated owner
        test_scenario::next_tx(&mut scenario, recipient);
        {
            let ticket = test_scenario::take_from_sender<Ticket>(&scenario);
            assert!(ticket.owner == recipient, 0);
            test_scenario::return_to_sender(&scenario, ticket);
        };

        test_scenario::end(scenario);
    }
}
