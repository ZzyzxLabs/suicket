module suicket::main;

use std::{
    string::{String},
    vector,
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
    balance::{Self, Balance},
};
// use sui::event;

// const EMaxSupplyReached: u64 = 0x1001;
// const ETicketAlreadyUsed: u64 = 0x1002;
// const ENotOwner: u64 = 0x1003;
// const EInvalidPayment: u64 = 0x1004;
const ENotEventOwner: u64 = 0x1000;
const EMaxSupplyReached: u64 = 0x1001;
const EAlreadyUsed: u64 = 0x1002;

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
    id: UID,
    event_id: ID,
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
    checked_in: vector<u64>
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
        checked_in: vector::empty()
    };
    let event_cap = EventCap {
        id: object::new(ctx),
        event_id: object::id(&event),
    };
    transfer::share_object(event);
    transfer::public_transfer(event_cap, ctx.sender());
}

#[allow(lint(self_transfer))]
public fun buy_ticket (user_coin: Coin<SUI>, event: &mut Event, ctx: &mut TxContext) : Ticket { 
    assert!(event.ticket_sold + 1 <= event.max_ticket_supply, EMaxSupplyReached);

    let mut user_balance: Balance<SUI> = coin::into_balance<SUI>(user_coin);
    let out_balance = balance::split<SUI>(&mut user_balance, event.price);

    let user_coin = coin::from_balance(user_balance, ctx);
    let out_coin = coin::from_balance(out_balance, ctx);
    // let out_coin = coin::split<SUI>( in_coin, event.price, ctx);

    let ticket = Ticket {
        id: object::new(ctx),
        event_id: object::id(event),
        event_name: event.event_name,
        image_url: event.image_url,
        ticket_number: event.ticket_sold+1,
        status: STATUS_VALID,
    };
    event.ticket_sold = event.ticket_sold + 1;
    transfer::public_transfer(user_coin, ctx.sender());
    transfer::public_transfer(out_coin, event.event_owner_address);
    ticket
}

public fun transfer_ticket(ticket: Ticket, recipient: address, _ctx: &mut TxContext) {
    transfer::public_transfer(ticket, recipient);
}

public fun use_ticket(ticket: &mut Ticket, _ctx: &mut TxContext) {
    assert!(ticket.status == STATUS_VALID, EAlreadyUsed);
    ticket.status = STATUS_USED;
}


// for event owner only
public fun update_description(eventCap: &EventCap, event: &mut Event, description: String, _ctx: &mut TxContext) {
    assert!(eventCap.event_id == object::id(event), ENotEventOwner);
    event.event_description = description;
}

public fun update_image_url(eventCap: &EventCap, event: &mut Event, image_url: String, _ctx: &mut TxContext) {
    assert!(eventCap.event_id == object::id(event), ENotEventOwner);
    event.image_url = image_url;
}

public fun update_max_ticket_supply(eventCap: &EventCap, event: &mut Event, max_ticket_supply: u64, _ctx: &mut TxContext) {
    assert!(eventCap.event_id == object::id(event), ENotEventOwner);
    event.max_ticket_supply = max_ticket_supply;
}

public fun update_price(eventCap: &EventCap, event: &mut Event, price: u64, _ctx: &mut TxContext) {
    assert!(eventCap.event_id == object::id(event), ENotEventOwner);
    event.price = price;
}

public fun delete_event(eventCap: &EventCap, event: Event, _ctx: &mut TxContext) {
    assert!(eventCap.event_id == object::id(&event), ENotEventOwner);
    let Event {id,
    event_name: _, 
    event_description: _,
    image_url: _,
    event_owner_address: _,
    max_ticket_supply: _,
    price: _,
    ticket_sold: _,
    checked_in: _ } = event;
    object::delete(id);
}