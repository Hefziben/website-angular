import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { log } from 'util';

@Component({
  selector: 'app-thankyou',
  templateUrl: './thankyou.component.html',
  styleUrls: ['./thankyou.component.scss']
})
export class ThankyouComponent implements OnInit {
customer;
address;
email;
shipping;
billing;
billing_address;
payment_method;
order;
  constructor(private route:ActivatedRoute,  private router: Router,) {
  
   }

  ngOnInit() {
    this.orderDetail();
  }
  
  orderDetail(){
    this.shipping = JSON.parse(localStorage.lastPaymentShipping).payer.payer_info.billing_address;
    this.customer = JSON.parse(localStorage.lastPaymentShipping).payer.payer_info;
   this.email = JSON.parse(localStorage.lastPaymentShipping);
   this.payment_method = JSON.parse(localStorage.lastPaymentShipping).payer.payment_method;
   this.order = JSON.parse(localStorage.lastPayment).orderid;
  this.billing =  JSON.parse(localStorage.lastPaymentShipping).payment.transactions[0].item_list.shipping_address;
  this.billing_address = this.shipping.line1 + ' ' +  this.shipping.city +', '+ this.shipping.state + ', ' + this.shipping.postal_code + ' ' + this.shipping.country_code;
 this.address = this.billing.line1 + ' ' +  this.billing.city +', '+ this.billing.state + ', ' + this.billing.postal_code + ' ' + this.billing.country_code;
    
   
    
  }


}
