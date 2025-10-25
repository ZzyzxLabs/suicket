module suicket::main;

use std::{
    string::{String},
    // vector,
    // type_name::{Self, TypeName},
};
// use sui::{
//     dynamic_field as df,
//     dynamic_object_field as dof,
//     balance::{Self, Balance},
//     coin::{Self, Coin},
//     object::{Self, UID, ID},
//     transfer,
//     tx_context::{Self, TxContext, epoch_timestamp_ms},
//     vec_map::{Self, VecMap},
//     sui::SUI,
//     clock::{Self, Clock},
//     table::{Table, Self},
//     event::emit,
// };
// use sui::event;

// const EMaxSupplyReached: u64 = 0x1001;
// const ETicketAlreadyUsed: u64 = 0x1002;
// const ENotOwner: u64 = 0x1003;
// const EInvalidPayment: u64 = 0x1004;

const STATUS_VALID: u8 = 0;
const STATUS_USED: u8 = 1;

// public struct AdminCap has key, store{
//     id: UID,
// }

public struct Ticket has key, store {
    id: UID,
    event_id: ID,
    event_name: String,
    image_url: String,
    ticket_number: u64,
    status: u8,
}

public struct EventCap has key, store {
    id: UID
}

public struct Event has key {
    id: UID,
    event_name: String,
    event_description: String,
    image_url: String,
    event_owner_address: address,
    max_ticket_supply: u64,
    price: u64,
    ticket_sold: u64,
}

// fun init(ctx: &mut TxContext) {
    // let cap = AdminCap {
    //     id: object::new(ctx),
    // };
    // transfer::public_transfer(cap, ctx.sender());
// }

#[allow(lint(self_transfer))]
public fun organize_event (event_name: String, event_description: String, image_url: String, max_ticket_supply: u64, price: u64, ctx: &mut TxContext) {
    let event = Event {
        id: object::new(ctx),
        event_name: event_name,
        event_description: event_description,
        image_url: image_url,
        event_owner_address: ctx.sender(),
        max_ticket_supply: max_ticket_supply,
        price: price,
        ticket_sold: 0,
    };
    transfer::share_object(event);
    let event_cap = EventCap {
        id: object::new(ctx),
    };
    transfer::public_transfer(event_cap, ctx.sender());
}

#[allow(lint(self_transfer))]
public fun buy_ticket (event: &mut Event, ctx: &mut TxContext) { 
    let ticket = Ticket {
        id: object::new(ctx),
        event_id: object::id(event),
        event_name: event.event_name,
        image_url: event.image_url,
        ticket_number: event.ticket_sold+1,
        status: STATUS_VALID,
    };
    event.ticket_sold = event.ticket_sold + 1;
    transfer::public_transfer(ticket, ctx.sender());
}

public fun transfer_ticket(ticket: Ticket, recipient: address, _ctx: &mut TxContext) {
    transfer::public_transfer(ticket, recipient);
}

public fun validate_ticket(ticket: &mut Ticket, _ctx: &mut TxContext) {
    ticket.status = STATUS_USED;
}

// public fun get_minted_count(counter: &EventCounter): u64 {
//     counter.minted
// }

// public fun get_ticket_number(ticket: &Ticket): u64 {
//     ticket.ticket_number
// }

// public fun get_owner(ticket: &Ticket): address {
//     ticket.owner
// }

// public fun get_status(ticket: &Ticket): u8 {
//     ticket.status
// }

// #[test_only]
// use sui::test_scenario;

// #[test]
// fun test_mint_within_supply() {
//     let admin = @0xAD;
//     let user = @0x1;

//     let mut scenario = test_scenario::begin(admin);

//     {
//         init(test_scenario::ctx(&mut scenario));
//     };

//     test_scenario::next_tx(&mut scenario, user);
//     {
//         let mut counter = test_scenario::take_shared<EventCounter>(&scenario);
//         mint_ticket(&mut counter, test_scenario::ctx(&mut scenario));
//         assert!(counter.minted == 1, 0);
//         test_scenario::return_shared(counter);
//     };

//     test_scenario::next_tx(&mut scenario, user);
//     {
//         let ticket = test_scenario::take_from_sender<Ticket>(&scenario);
//         assert!(ticket.ticket_number == 1, 1);
//         assert!(ticket.owner == user, 2);
//         assert!(ticket.status == STATUS_VALID, 3);
//         test_scenario::return_to_sender(&scenario, ticket);
//     };

//     test_scenario::end(scenario);
// }

// #[test]
// #[expected_failure(abort_code = EMaxSupplyReached)]
// fun test_exceed_max_supply() {
//     let admin = @0xAD;
//     let user = @0x1;

//     let mut scenario = test_scenario::begin(admin);

//     {
//         init(test_scenario::ctx(&mut scenario));
//     };

//     test_scenario::next_tx(&mut scenario, user);
//     {
//         let mut counter = test_scenario::take_shared<EventCounter>(&scenario);
//         let mut i = 0;
//         while (i < 51) {
//             mint_ticket(&mut counter, test_scenario::ctx(&mut scenario));
//             i = i + 1;
//         };
//         test_scenario::return_shared(counter);
//     };

//     test_scenario::end(scenario);
// }

// #[test]
// fun test_use_ticket_success() {
//     let admin = @0xAD;
//     let user = @0x1;

//     let mut scenario = test_scenario::begin(admin);

//     {
//         init(test_scenario::ctx(&mut scenario));
//     };

//     test_scenario::next_tx(&mut scenario, user);
//     {
//         let mut counter = test_scenario::take_shared<EventCounter>(&scenario);
//         mint_ticket(&mut counter, test_scenario::ctx(&mut scenario));
//         test_scenario::return_shared(counter);
//     };

//     test_scenario::next_tx(&mut scenario, user);
//     {
//         let mut ticket = test_scenario::take_from_sender<Ticket>(&scenario);
//         use_ticket(&mut ticket, test_scenario::ctx(&mut scenario));
//         assert!(ticket.status == STATUS_USED, 0);
//         test_scenario::return_to_sender(&scenario, ticket);
//     };

//     test_scenario::end(scenario);
// }

// #[test]
// #[expected_failure(abort_code = ETicketAlreadyUsed)]
// fun test_prevent_double_use() {
//     let admin = @0xAD;
//     let user = @0x1;

//     let mut scenario = test_scenario::begin(admin);

//     {
//         init(test_scenario::ctx(&mut scenario));
//     };

//     test_scenario::next_tx(&mut scenario, user);
//     {
//         let mut counter = test_scenario::take_shared<EventCounter>(&scenario);
//         mint_ticket(&mut counter, test_scenario::ctx(&mut scenario));
//         test_scenario::return_shared(counter);
//     };

//     test_scenario::next_tx(&mut scenario, user);
//     {
//         let mut ticket = test_scenario::take_from_sender<Ticket>(&scenario);
//         use_ticket(&mut ticket, test_scenario::ctx(&mut scenario));
//         test_scenario::return_to_sender(&scenario, ticket);
//     };

//     test_scenario::next_tx(&mut scenario, user);
//     {
//         let mut ticket = test_scenario::take_from_sender<Ticket>(&scenario);
//         use_ticket(&mut ticket, test_scenario::ctx(&mut scenario));
//         test_scenario::return_to_sender(&scenario, ticket);
//     };

//     test_scenario::end(scenario);
// }

// #[test]
// #[expected_failure(abort_code = ENotOwner)]
// fun test_only_owner_can_use() {
//     let admin = @0xAD;
//     let user = @0x1;
//     let attacker = @0x2;

//     let mut scenario = test_scenario::begin(admin);

//     {
//         init(test_scenario::ctx(&mut scenario));
//     };

//     test_scenario::next_tx(&mut scenario, user);
//     {
//         let mut counter = test_scenario::take_shared<EventCounter>(&scenario);
//         mint_ticket(&mut counter, test_scenario::ctx(&mut scenario));
//         test_scenario::return_shared(counter);
//     };

//     test_scenario::next_tx(&mut scenario, attacker);
//     {
//         let mut ticket = test_scenario::take_from_address<Ticket>(&scenario, user);
//         use_ticket(&mut ticket, test_scenario::ctx(&mut scenario));
//         test_scenario::return_to_address(user, ticket);
//     };

//     test_scenario::end(scenario);
// }

// #[test]
// fun test_transfer_ticket() {
//     let admin = @0xAD;
//     let user = @0x1;
//     let recipient = @0x2;

//     let mut scenario = test_scenario::begin(admin);

//     {
//         init(test_scenario::ctx(&mut scenario));
//     };

//     test_scenario::next_tx(&mut scenario, user);
//     {
//         let mut counter = test_scenario::take_shared<EventCounter>(&scenario);
//         mint_ticket(&mut counter, test_scenario::ctx(&mut scenario));
//         test_scenario::return_shared(counter);
//     };

//     test_scenario::next_tx(&mut scenario, user);
//     {
//         let ticket = test_scenario::take_from_sender<Ticket>(&scenario);
//         transfer_ticket(ticket, recipient, test_scenario::ctx(&mut scenario));
//     };

//     test_scenario::next_tx(&mut scenario, recipient);
//     {
//         let ticket = test_scenario::take_from_sender<Ticket>(&scenario);
//         assert!(ticket.owner == recipient, 0);
//         test_scenario::return_to_sender(&scenario, ticket);
//     };

//     test_scenario::end(scenario);
// }
