import { Component, OnInit, AfterViewChecked } from '@angular/core';
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';


import { of } from 'rxjs';
import { PayPalConfig, PayPalEnvironment, PayPalIntegrationType } from 'ngx-paypal';
import { Router, NavigationExtras } from '@angular/router';

import { countries } from './country'
import { productService } from 'app/lib/service/product.service';
import { HttpClient } from '@angular/common/http';

declare let paypal: any;

declare let Accept: any;

@Component({
  selector: 'app-guest-checkout',
  templateUrl: './guest-checkout.component.html',
  styleUrls: ['./guest-checkout.component.scss']
})
export class GuestCheckoutComponent implements OnInit, AfterViewChecked {
  model: any = {};
  
  shipping: any = {};
  card = { name: null, number: null, month: null, year: null, cvv: null };
  same = true;
  imgUrl = 'https://www.licenseplates.tv/images/';
  Items: any;
  sum: number = 0.00;
  check: boolean;
  country = 'United States';
  state = 'Alberta';
  payPalConfig?: PayPalConfig;
  coupon: number = 0.00;
  orderDetails;
  Countries = countries;
  tax: number = 0.00;
  ship_amt: number = 0.00;
  totalAmount: number = 0.00;
  cardProcessing:Boolean = false;
  // // production code working
  apiLoginID = '9Nd3y7r76VF';//9Nd3y7r76VF
  clientKey = '7h3Xvgn97K3Vkf9u6gkGzcj8k23thba7K4n9537JUMMC4fgs25LqBsNWWBNSFXje';
  transactionKey = '53j562rZTM3kYrLu';//53j562rZTM3kYrLu
  apiUrl = 'https://api.authorize.net/xml/v1/request.api';
  // ///end

  //testing code working
  // apiLoginID  = '3a4zQV8XRuCT';//9Nd3y7r76VF
  // clientKey = '8G5hYgVT92u5uv8m2M7byC93V7BX44jFq2DumfHaDn9JdPyQn5h4pa4FBTD5Dhxq';
  // apiUrl = 'https://apitest.authorize.net/xml/v1/request.api';
  // transactionKey = '4HeCaRS4L4m625yw';

  addScript: boolean = false;
  paypalLoad: boolean = true;
  doPaypal: boolean;
  finalAmount: number = 1; //  sandbox: 'AZDxjDScFpQtjWTOUtWKbyN_bDt4OgqaF4eYXlewfBP4-8aqX3PiV8e1GWU6liB2CUXlkA59kJXE7M6R',

  paypalConfig = {
    env: 'production',
    client: {
      sandbox: 'AQRNAkeUZt_HJYsAKwXwFWVSYlorOGjtT4k_PzWwY-fuVIRjkunB9qxOGVPLnR_7Up7qZkL3ML9VQSg4',
      production: 'AeZzJUqyE4AtG7VI54dadwdJeJIvylhghKmmBJkcTNZD0FwE7nstpM1w-8xj7iMmjnow56SYmF9OFgz2'
    
    },
    commit: true,
    payment: (data, actions) => {
      return actions.payment.create({
        payer: {
          payment_method: 'paypal',
          payer_info: {
            first_name: this.model.fname,
            last_name: this.model.lname,
            email: this.model.email,
            country_code: this.model.countryCode,
            billing_address: {
              line1: this.model.street_address,
              line2: this.model.address_line_1,
              city: this.model.city,
              country_code: this.model.countryCode,
              postal_code: this.model.zipcode,
              state: this.model.state,
              phone: this.model.phone
            }
          }
        },
        payment: {
          transactions: [
            {
              amount: {
                total: this.totalAmount,
                currency: 'USD',
                details: {
                  subtotal: this.sum,
                  tax: this.tax,
                  shipping: this.ship_amt,
                  handling_fee: 0,
                  shipping_discount: this.coupon
                }
              },
              item_list: {
                items: this.paypalArray,
                shipping_address: {
                  recipient_name: this.same ? this.model.fname + ' ' + this.model.lname : this.shipping.fname + ' ' + this.shipping.lname,
                  line1: this.same ? this.model.street_address : this.shipping.street_address,
                  line2: this.same ? this.model.address_line_1 : this.shipping.address_line_2,
                  city: this.same ? this.model.city : this.shipping.city,
                  state: this.same ? this.model.state : this.shipping.state,
                  country_code: this.model.countryCode,
                  postal_code: this.same ? this.model.zipcode : this.shipping.zipcode
                }
              }
            }
          ]
        }
      });
    },
    onAuthorize: (data, actions) => {
      this.verifying = true;
      //console.log(data);
      actions.payment.execute().then((payment) => {
        console.log(payment);
        localStorage.lastPayment = JSON.stringify(payment);
        localStorage.cartItems = JSON.stringify([]);
        this.paymentSuccess(payment);
        // if ( this.same === false) {
        //   localStorage.lastPaymentShipping = JSON.stringify(this.shipping);
        // }
        // this.router.navigateByUrl('success')
      });
    },
    onCancel: (data, actions) => {
      //console.log('Payment Failed');
      alert('Payment was Cancelled!');
      this.verifying = false;
    },
    onError: (err) => {
      //console.log('Payment Error', err);
      alert('Error occured!');
      this.verifying = false;
    },
    style: {
      size: 'medium',
      color: 'gold',
      shape: 'pill',
      label: 'checkout',
      tagline: 'true'
    }
  }; // end of paypal config
  
  paypalArray: any[];
  clicked: boolean;
  User: any;
  loggedIn: boolean;
  verifying: boolean;

  constructor(private router: Router,
    public _productService: productService,
    private _http: HttpClient,
    ) { }

  ngOnInit() {
    this.model.coupon = "";
    this.getCartitems();
    this.getTotal();
    this.getUser();
    this.paypalArr();
    this.getCartItems();
    
  }

  getUser() {
    this.User = JSON.parse(localStorage.getItem('currentUser'));
    if (this.User) {
      this.loggedIn = true;
      this.model.fname = this.User.firstname ? this.User.firstname : '';
      this.model.lname = this.User.lastname ? this.User.lastname : '';
    }
  }

  getItem(item) {
    // console.log('getItem');
    // console.log(item);
    if (this.same === true) {
      this.model.country = item.name;
      this.model.countryCode = item.code;
      // console.log(this.model.country);
      if (this.model.country === 'United States') {
        this.ship_amt = 0;
      }
      if (this.model.country === 'Canada') {
        this.ship_amt = 30;
      }
      if (this.model.country !== 'Canada' && this.model.country !== 'United States') {
        this.ship_amt = 50;
      }
    }
  }

  paypalArr() {
    let paypalArray = [];

    for (let i = 0; i < this.Items.length; i++) {
      let obj = {
        name: this.Items[i].productName,
        // tslint:disable-next-line:max-line-length
        description: this.Items[i].plateText1 ? this.Items[i].plateText1 : '' + ' ' + this.Items[i].plateText2 ? + '& ' + this.Items[i].plateText2 : '',
        quantity: this.Items[i].itemQuantity,
        price: this.Items[i].TotalPrice,
        sku: this.Items[i].plateType,
        currency: 'USD'
      }
      paypalArray.push(obj);
    }
    // console.log(paypalArray);
    this.paypalArray = paypalArray;
  }

  getCartitems() {
    this.Items = JSON.parse(localStorage.getItem('cartItems'));
    this.model.country = 'United States';
    this.shipping.country = 'United States';
    this.model.countryCode = 'US';
    this.shipping.countryCode = 'US';
    // this.paypalArr();
  }

  getTotalAmount() {
    let total = this.sum + this.ship_amt + this.tax - this.coupon;
    total=Math.round(total * 100) / 100;
    this.totalAmount=total;
    return total;
  }

  onEditClick(e) {
    // console.log(e);
  }

  checkCountry(e) {
    let selectedOptions = event.target['options'];
    let selectedIndex = selectedOptions.selectedIndex;
    let country = selectedOptions[selectedIndex].text;
    // console.log(this.country);
    // console.log(e);
    if (this.same === true) {
      this.model.country = country;
      this.model.countryCode = e.target.value;
      // console.log(e.target.value);
      // console.log(this.model.country);
      if (this.model.country === 'United States') {
        this.ship_amt = 0;
        this.model.state = '';
      }
      if (this.model.country === 'Canada') {
        this.ship_amt = 30;
        this.model.state = '';
      }
      if (this.model.country !== 'Canada' && this.model.country !== 'United States') {
        this.ship_amt = 50;
        this.model.state = '';
      }
    }
  }

  CheckState(e) {
    let selectedOptions = event.target['options'];
    let selectedIndex = selectedOptions.selectedIndex;
    let state = selectedOptions[selectedIndex].text;
    this.model.state = state;
    // console.log(state);
    if (this.model.state == 'Florida') {
      let taxVal = this.sum * (7 / 100);
      this.tax = Math.round(taxVal * 100) / 100;
    } else {
      this.tax = 0.00;
    }
  }

  checkState(e) {
    // console.log('moz val');
    // console.log(e);
    this.model.state = e;
  }

  checkCountryShip(e) {
    let selectedOptions = event.target['options'];
    let selectedIndex = selectedOptions.selectedIndex;
    let country = selectedOptions[selectedIndex].text;
    this.country = country;
    // console.log('Country is ', this.country)
    if (this.country === 'United States') {
      this.ship_amt = 0;
      this.shipping.state = '';
    }
    if (this.country === 'Canada') {
      this.ship_amt = 30;
      this.shipping.state = '';
    }
    if (this.country !== 'Canada' && this.shipping.country !== 'United States') {
      this.ship_amt = 50;
      this.shipping.state = '';
    }
  }

  checkStateShip(e) {
    // this.shipping.state  = e;
    // console.log(e);
    let selectedOptions = event.target['options'];
    let selectedIndex = selectedOptions.selectedIndex;
    let state = selectedOptions[selectedIndex].text;
    this.shipping.state = state;
    // console.log(this.shipping.state);
    if (this.shipping.state == 'Florida') {
      let taxVal = (this.sum - this.coupon) * (7 / 100);
      this.tax = Math.round(taxVal * 100) / 100;
    } else {
      this.tax = 0.00;
    }
  }

  getTotal() {
    let result = this.Items.map(a => a.TotalPrice);
    // console.log(result);
    this.sum = result.reduce((a, b) => { return a + b; }, 0);
    console.log(this.sum);
    
  }

  checkout() {
    //this.cardProcessing = true;
    //console.log('clicked!')
    // console.log(this.model)
    // this.addScript = true;
    // tslint:disable-next-line:max-line-length
    // console.log(this.model);
    if (!this.model.fname || !this.model.lname || !this.model.street_address || !this.model.city || !this.model.country || !this.model.state || !this.model.zipcode || !this.model.phone || !this.model.email) {
      this.check = true;
      this.cardProcessing = false;
      alert('Some Billing Infomartions are empty!')
    } else {
      if (this.same) { this.sendPaymentDataToAnet();
        this.cardProcessing = true;
       }
    }
    // diffrent address
    if (this.same === false) {
      // tslint:disable-next-line:max-line-length
      if (!this.shipping.fname || !this.shipping.lname || !this.shipping.street_address || !this.shipping.city || !this.shipping.country || !this.shipping.state || !this.shipping.zipcode) {
        this.check = true;
        this.cardProcessing = false;
        alert('Some Shipping Infomartions are empty!')
      } else {
        this.sendPaymentDataToAnet()
        this.cardProcessing = true;
      }
    }
  }

  initConfig() {
    // console.log('clicked!')
    // console.log(this.model)
    // this.addScript = true;
    // tslint:disable-next-line:max-line-length
    if (!this.model.fname || !this.model.lname || !this.model.street_address || !this.model.city || !this.model.country || !this.model.state || !this.model.zipcode || !this.model.phone || !this.model.email) {
      this.check = true;
      alert('Some Billing Infomartions are empty!')
    } else {
      if (this.same) { this.doPaypal = true; }
      this.getTotalAmount();
    }
    // diffrent address
    if (this.same === false) {
      // tslint:disable-next-line:max-line-length
      if (!this.shipping.fname || !this.shipping.lname || !this.shipping.street_address || !this.shipping.city || !this.shipping.country || !this.shipping.state || !this.shipping.zipcode) {
        this.check = true;
        alert('Some Shipping Infomartions are empty!')
      } else {
        this.doPaypal = true;
         this.getTotalAmount();
      }
    }
  }

  setval() {
    // console.log(this.same);
    // console.log('invalid');
  }

  ngAfterViewChecked(): void {
    if (!this.addScript) {
      this.addPaypalScript().then(() => {
        paypal.Button.render(this.paypalConfig, '#paypal-checkout-btn')
        //console.log('here');
        
      });
      //
      //this.addAuthnetScript();
    }
  }

  getCartitemCount() {
    // let Items = JSON.parse(localStorage.getItem('cartItems'));
    // // console.log(Items);
    // // console.log(Items.length);
    let itemNum = 0;
    this._productService.changeItem(itemNum);
  }

  getValues() {
    // console.log(this.model);
    // console.log(this.shipping);
  }

  addPaypalScript() {
    this.addScript = true;
    return new Promise((resolve, reject) => {
      let scripttagElement = document.createElement('script');
      scripttagElement.src = 'https://www.paypalobjects.com/api/checkout.js';
      scripttagElement.onload = resolve;
      document.body.appendChild(scripttagElement);
    })
  }


  sendPaymentDataToAnet() {
    this.cardProcessing = true;
    //console.log("sendPaymentDataToAnet()");
    if (this.card.name && this.card.number && this.card.month && this.card.year) {
     // console.log('Auth.net ready!')
      
      let authData = {
        clientKey: this.clientKey,
        apiLoginID : this.apiLoginID
      };


      let cardData = {
        cardNumber: this.card.number,
        month: this.card.month,
        year: this.card.year,
        cardCode: this.card.cvv,
        fullName: this.card.name
      };
      
      let secureData = {
        authData: authData,
        cardData: cardData
      };
       
      // If using banking information instead of card information,
      // send the bankData object instead of the cardData object.
          // secureData.bankData = bankData;
          let lastResponse = null;  
          Accept.dispatchData(secureData, response => {
            // just in case it still gets called twice, ignore the second call
                if (response == lastResponse) {
              //console.log("skipping duplicated responseHandler() call because it's the same response as the previous response");
              return;
          }
          lastResponse = response;
         // console.log("responseHandler function called");
          if (response.messages.resultCode === "Error"){
             // stopLoading();
             
             var i = 0;
             while (i < response.messages.message.length) {
              // console.log(
              //     response.messages.message[i].code + ": " +
              //     response.messages.message[i].text
              // );
              // only show the user the first error message
              if (i == 0) {
                  var error = response.messages.message[i].text;
                  console.error("Error", error);
                  this.cardProcessing = false;
              }	
              i = i + 1;
          }

          } else {
            let opaqueData = response.opaqueData;
            let total = this.sum + this.ship_amt + this.tax - this.coupon;
            total = Math.round(total * 100) / 100;
            this.totalAmount = total;
           
            
            //console.log(response.messages);
            //console.log(response)
            let paymentData = {};
            let createTransactionRequest = {};
            let merchantAuthentication = {
              name: this.apiLoginID,
              transactionKey: this.transactionKey,
              
            }
            //console.log('1 got merchant auth');      
            //console.log(merchantAuthentication);
                  
            // create billing and shipping address object
            let billTo = {
              firstName: this.model.fname,
              lastName: this.model.lname,
              company: this.model.company,
              address: this.model.street_address + ' ' + this.model.address_line_1,
              city: this.model.city,
              state: this.model.state,
              zip: this.model.zipcode,
              country: this.model.countryCode
            };
      
            let shipTo = {};
            if (this.same) {
              shipTo = billTo;
            } else {
              shipTo = {
                firstName: this.shipping.fname,
                lastName: this.shipping.lname,
                company: this.shipping.company,
                address: this.shipping.street_address + ' ' + this.shipping.address_line_1,
                city: this.shipping.city,
                state: this.shipping.state,
              zip: this.shipping.zipcode,
                country: this.model.countryCode
              }
            }
            // end
      
            let transactionRequest = {
              transactionType: "authCaptureTransaction",
              amount: this.totalAmount,
              payment: {
                opaqueData: opaqueData
              },
              billTo: billTo,
              shipTo: shipTo
            }
            //console.log('2 got trans request');      
            //console.log(transactionRequest);
      
            createTransactionRequest['merchantAuthentication'] = merchantAuthentication;
            createTransactionRequest['transactionRequest'] = transactionRequest;
            paymentData['createTransactionRequest'] = createTransactionRequest;
            //console.log('3 got payment data');      
            //console.log(paymentData);
            this.makeAuthorizeDotNetPayment(response.opaqueData,paymentData );
        }
      });
      
      
    } else {
      alert('Card Details are not completed!')
    }
  }

    makeAuthorizeDotNetPayment = (response, postData) => {
    
    this.verifying = true;
    this._http.post(this.apiUrl, postData).subscribe(
      (res) => {
        //console.log('3 got response'); 
        let date = new Date();
        let paymentId = res['transactionResponse'].transId  
        
        if (res['messages'] && res['messages']['resultCode'] === "Ok") {
          this.verifying = false;
          
       
          // data
          let orderData = {
            cart: {
              cart:'',
              create_time: date,
              id: paymentId,
              intent: 'Sales',
              currency: 'USD',
            },
            payer: {
              payment_method: 'Authorize.net',
              payer_info: {
                first_name: this.model.fname,
                last_name: this.model.lname,
                email: this.model.email,
                country_code: this.model.countryCode,
                billing_address: {
                  line1: this.model.street_address,
                  line2: this.model.address_line_1,
                  city: this.model.city,
                  country_code: this.model.countryCode,
                  postal_code: this.model.zipcode,
                  state: this.model.state,
                  phone: this.model.phone
                }
              }
            },           
            payment: {
              transactions: [
                {
                  amount: {
                    total: this.totalAmount,
                    currency: 'USD',
                    details: {
                      subtotal: this.sum,
                      tax: this.tax,
                      shipping: this.ship_amt,
                      handling_fee: 0,
                      coupon_discount: this.coupon,
                      coupon_code: this.model.coupon,
                      special_instruction: this.model.instructions
                    }
                  },
                  
                  item_list: {
                    items: this.Items,
                    shipping_address: {
                      recipient_name: this.same ? this.model.fname + ' ' + this.model.lname : this.shipping.fname + ' ' + this.shipping.lname,
                      line1: this.same ? this.model.street_address : this.shipping.street_address,
                      line2: this.same ? this.model.address_line_1 : this.shipping.address_line_2,
                      city: this.same ? this.model.city : this.shipping.city,
                      state: this.same ? this.model.state : this.shipping.state,
                      country_code: this.model.countryCode,
                      postal_code: this.same ? this.model.zipcode : this.shipping.zipcode
                    }
                  }
                 }
              ]
            }
          }
          let data = {
            cart: {
              create_time: date,
              id: paymentId,
              intent: 'Sales',
              currency: 'USD',
            },
            payer: orderData.payer,
            items: this.Items
          };
          this.orderDetails = orderData;
          console.log(orderData);
         console.log(localStorage.lastPayment);
     // send to server
     this._productService.postOrderData(orderData)
    .subscribe((res: any) => {
      if (res.success == 1) {
        console.log(res);
       
        localStorage.lastPayment = JSON.stringify(res);
        localStorage.cartItems = JSON.stringify([]);
        localStorage.lastPaymentShipping = JSON.stringify(orderData);
        this.getCartitemCount();
       
        this.verifying = false;
        this.cardProcessing = false;
        this.router.navigateByUrl('success');
      } else {
        // console.log('Payment Failed');
        
      }
    });
          
        } else {
          this.cardProcessing = false;
          alert('Payment Failed');
          
          
        }
      },
      (error) => {
        this.cardProcessing = false;
        //console.log(error);
        
      }
    )
  }

  goBack() {
    this.doPaypal = !this.doPaypal;
    // this.addScript = !this.addScript;
  }

  checkCoupon() {
    // // console.log(this.coupon);
    this._productService.getCoupon(this.model.coupon)
      .subscribe((res: any) => {
        // console.log(res);
        if (res.success === '1') {
          // this.coupon = res.couponamt.toString();
          // alert(res.message);
          if (res.coupon_type === 'F') {
            this.coupon = Math.round(parseFloat(res.couponamt) * 100) / 100;
            alert(res.message);
          } else if (res.coupon_type === 'P' || res.coupon_type === 'E') {
            this.addPercentage(res);
          }
          if (this.model.state == 'Florida') {
            let taxVal = (this.sum - this.coupon) * (7 / 100);
            this.tax = Math.round(taxVal * 100) / 100;
          } else {
            this.tax = 0.00;
          }
        } else {
          alert(res.message);
          this.coupon = 0;
        }
      });
  }

  addPercentage(res) {
    let discount = +this.sum * (parseFloat(res.couponamt) / 100);
    // console.log('discount is ', discount.toFixed(2));
    this.coupon = Math.round(discount * 100) / 100;
    alert(res.message);
  }

  paymentSuccess(payment) {
    // this.Items = JSON.parse(localStorage.getItem('cartItems'));
    let data = {
      cart: {
        cart: payment.cart,
        create_time: payment.create_time,
        id: payment.id,
        intent: payment.intent,
        currency: 'USD',
      },
      payer: payment.payer,
      items: this.Items
    };



    let saveData = {
      payer: {
        payment_method: 'paypal',
        payer_info: {
          first_name: this.model.fname,
          last_name: this.model.lname,
          email: this.model.email,
          country_code: this.model.countryCode,
          billing_address: {
            line1: this.model.street_address,
            line2: this.model.address_line_1,
            city: this.model.city,
            country_code: this.model.countryCode,
            postal_code: this.model.zipcode,
            state: this.model.state,
            phone: this.model.phone
          }
        }
      },
      cart: {
        cart: payment.cart,
        create_time: payment.create_time,
        id: payment.id,
        intent: payment.intent,
        currency: 'USD',
      },
      payment: {
        transactions: [
          {
            amount: {
              total: this.totalAmount,
              currency: 'USD',
              details: {
                subtotal: this.sum,
                tax: this.tax,
                shipping: this.ship_amt,
                handling_fee: 0,
                coupon_discount: this.coupon,
                coupon_code: this.model.coupon,
                special_instruction: this.model.instructions
              }
            },
            item_list: {
              items: this.Items,
              shipping_address: {
                recipient_name: this.same ? this.model.fname + ' ' + this.model.lname : this.shipping.fname + ' ' + this.shipping.lname,
                line1: this.same ? this.model.street_address : this.shipping.street_address,
                line2: this.same ? this.model.address_line_1 : this.shipping.address_line_2,
                city: this.same ? this.model.city : this.shipping.city,
                state: this.same ? this.model.state : this.shipping.state,
                country_code: this.model.countryCode,
                postal_code: this.same ? this.model.zipcode : this.shipping.zipcode
              }
            }
          }
        ]
      }
    }

    // send to server
    // localStorage.lastPaymentAdress = JSON.stringify(this.model);
    this._productService.postOrderData(saveData)
      .subscribe((res: any) => {
        // console.log(res);
        if (res.success == 1) {
          // this.paymentSuccess(payment)
          this.getCartitemCount();
         // console.log('success', saveData);
         localStorage.lastPayment = JSON.stringify(res);
         localStorage.cartItems = JSON.stringify([]);
         localStorage.lastPaymentShipping = JSON.stringify(saveData);
         this.getCartitemCount();
        
         this.verifying = false;
         this.cardProcessing = false;
         this.router.navigateByUrl('success')
        
        } else {
          // console.log('Payment Failed');
        }
      });

  } // paymentSuccess

getCartItems(){
  
 let cartDetails = JSON.parse(localStorage.cartItems);
console.log(cartDetails);

  
}
 // Select Category
 gotoSucess(saveData){
  this.router.navigate(['success']);
}
}
