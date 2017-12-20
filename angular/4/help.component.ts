import { Component, OnInit, OnDestroy } from '@angular/core';

import { TicketService } from './../../../services/ticket.service';
import { PopupService } from './../../../services/popup.service';

import { Ticket } from './../../../interfaces/ticket';

@Component({
  selector: 'wager-help',
  templateUrl: './help.component.html'
})
export class HelpComponent implements OnInit {

  private ticketList: Array<Ticket>;
  private timeFilter: '1' | '2' | '7' | '30' | '365' | 'all' = 'all';
  private statusFilter: 'all' | 'open' | 'pending' | 'solved' | 'on-hold' | 'closed' = 'all';
  private loading: boolean;

  private ticketsSubscriber: any;

  private isOpenedTicket: boolean = false;

  constructor(
    private ticketService: TicketService,
    private popupService: PopupService
  ) {
    
    this.ticketsSubscriber = this.ticketService.userTickets.subscribe(({ setOutStatus, tickets }) => {

      this.statusFilter = setOutStatus || this.statusFilter;

      if (this.ticketList || !tickets) {
        return this.ticketList = tickets;
      }

      if (this.statusFilter === 'all' && !tickets.length) {
        return this.ticketList = null;
      }

      let openedTickets: Array<Ticket> = tickets ? tickets.filter(ticket => ticket.status === 'open') : tickets;

      this.ticketList = openedTickets.length ? openedTickets : tickets;
      this.statusFilter = this.ticketList && this.ticketList.every(ticket => ticket.status === 'open') ? 'open' : 'all';
      this.isOpenedTicket = Boolean(openedTickets && openedTickets.length);
    });
  }

  onSetFilter(e: MouseEvent, filterName: string) {

    this[`${ filterName }Filter`] = e.target['value'];

    this.getTicketList();
  }

  onCreateTicket() {

    this.popupService.setPopupState('modalCreateTicket', true);
  }

  onOpenChat(ticketId: string) {

    this.popupService.setPopupState('modalTicketChat', true);
    this.ticketService.getCurrentTicket(ticketId).subscribe();
  }

  ngOnInit() {
    this.getTicketList();
  }

  ngOnDestroy() {
    this.ticketService.userTickets.next({});
    this.ticketsSubscriber.unsubscribe();
  }

  getTicketList() {

    this.loading = true;

    this.ticketService.getUserTickets({
      days: this.timeFilter,
      status: this.statusFilter
    }).subscribe(
      (tickets: Array<Ticket>) => this.loading = false,
      err => this.loading = false
    )
  }
}
