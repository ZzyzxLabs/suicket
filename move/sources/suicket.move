module suicket::main;

use std::{
    string::{String},
    // vector,
    // type_name::{Self, TypeName},
};
use sui::{
//     dynamic_field as df,
//     dynamic_object_field as dof,
//     balance::{Self, Balance},
    coin::{Self, Coin},
//     object::{Self, UID, ID},
//     transfer,
//     tx_context::{Self, TxContext, epoch_timestamp_ms},
//     vec_map::{Self, VecMap},
    sui::SUI,
//     clock::{Self, Clock},
//     table::{Table, Self},
//     event::emit,
};
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
public fun buy_ticket (in_coin: &mut Coin<SUI>, event: &mut Event, ctx: &mut TxContext) { 
    let out_coin = coin::split( in_coin, event.price, ctx);

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
    
    transfer::public_transfer(out_coin, event.event_owner_address);
}

public fun transfer_ticket(ticket: Ticket, recipient: address, _ctx: &mut TxContext) {
    transfer::public_transfer(ticket, recipient);
}

public fun validate_ticket(ticket: &mut Ticket, _ctx: &mut TxContext) {
    ticket.status = STATUS_USED;
}
