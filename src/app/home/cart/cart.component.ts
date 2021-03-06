import { Component, OnInit } from '@angular/core';
import { productService } from 'app/lib/service/product.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.scss']
})
export class CartsComponent implements OnInit {
  imgUrl = 'https://www.licenseplates.tv/images/';
  Items: any;
  num = 1;
  User: any = {};
  loggedIn: boolean;
  constructor(private _productService: productService, private router: Router) { }

  ngOnInit() {
    this.getCartitems();
    this.getUser();
  }

  getCartitems() {
    this.Items = JSON.parse(localStorage.getItem('cartItems'));
  }

  getUser() {
    this.User = JSON.parse(localStorage.getItem('currentUser'));
    if (this.User) {
      this.loggedIn = true;
    }
  }

  goHome() {
    this.router.navigateByUrl('');
  }

  goCheckout() {
    this.router.navigateByUrl('guestCheckout');
  }

  decriment(item) {
    if (item.itemQuantity !== 1) {
      item.itemQuantity -= 1;
      let unitVal = parseFloat(item.UnitPrice) + parseFloat(item.platePrice);
    // tslint:disable-next-line:radix
    item.TotalPrice = item.TotalPrice - unitVal;
    localStorage.cartItems = JSON.stringify(this.Items);
    }
  }

  incriment(item) {
    item.itemQuantity += 1;
    console.log(this.Items);
    let unitVal = parseFloat(item.UnitPrice) + parseFloat(item.platePrice);
    // tslint:disable-next-line:radix
    item.TotalPrice = item.TotalPrice + unitVal;
    localStorage.cartItems = JSON.stringify(this.Items);
  }

  remove(i) {
    this.Items.splice(i, 1);
    localStorage.cartItems = JSON.stringify(this.Items);
    this.getCartitemCount();
  }

  edit(item, i) {
    item.indexVal = i;
    localStorage.editItem = JSON.stringify(item);
    this.router.navigateByUrl('editItem/' + item.productID);
  }

  getProduct(item) { // productID
    this.router.navigateByUrl('producDetails/' + item.productID);
  }

  getCartitemCount() {
    let Items = JSON.parse(localStorage.getItem('cartItems'));
    const itemNum = Items.length;
    console.log(itemNum);
    this._productService.changeItem(itemNum);
  }

}
