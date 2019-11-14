import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { productService } from 'app/lib/service/product.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
  subCat: boolean;
  categories: Object;
  subCategories: any;
  catName: any;
  navOpen: boolean;
  search: boolean;
  itemNum = '';
  User: any;
  loggedIn: boolean;
  searchText;
  constructor(public _productService: productService, private router: Router, private changes:ChangeDetectorRef) { }

  ngOnInit() {
    //this.searchByName();
    this.getCategories();
    // this.getCartitemCount();
    this._productService.currentData.subscribe( data => {
      if (data) {
        console.log('new data is ', data);
        this.itemNum = data;
      } else {
        let Items = JSON.parse(localStorage.getItem('cartItems'));
        if (Items) {
          this.itemNum = Items.length;
        }
      }
    });
    // this.getUser();
    this._productService.authData.subscribe( data => {
      if (data) {
        console.log('user logged in ', data);
        this.loggedIn = data;
        this.getUser();
      } else {
        this.User = JSON.parse(localStorage.getItem('currentUser'));
        if (this.User) {
          this.loggedIn = true;
          this.getUser();
        }
      }
    });
  }

  checkNav() {
    if (this.navOpen) {
      this. closeNav();
    }
  }

  getUser() {
    this.User = JSON.parse(localStorage.getItem('currentUser'));
    if (this.User) {
      this.loggedIn = true;
    }
  }

  logout() {
    localStorage.removeItem('currentUser');
    this.loggedIn = !this.loggedIn;
    document.getElementById('mySidenav').style.width = '0%';
    this.router.navigateByUrl('')
    // window.location.reload();
  }

  getCartitemCount() {
    let Items = JSON.parse(localStorage.getItem('cartItems'));

    this.itemNum = this._productService.itemNum ? this._productService.itemNum : 0;
  }

  openNav() {
    document.getElementById('mySidenav').style.width = '80%';
    // document.getElementById('main').style.marginLeft = '250px';
    // document.body.style.backgroundColor = 'rgba(0,0,0,0.4)';
    this.navOpen = true;
  }

  closeNav() {
    document.getElementById('mySidenav').style.width = '0%';
  // document.getElementById('main').style.marginLeft = '0';
  // document.body.style.backgroundColor = 'white';
  }

  closeSubCat() {
    this.subCat = !this.subCat;
  }

  closeSearch() {
    this.search = !this.search;
    document.getElementById('searchBlock').style.width = '0%';
  }

  Search() {    
    this.search = true;
    document.getElementById('searchBlock').style.width = '100%';

  }
searchByName(){
  this.changes.detectChanges();
  this.search = !this.search;
  document.getElementById('searchBlock').style.width = '0%';
  console.log(this.searchText);  
  this.router.navigateByUrl('categories/' + this.searchText).then(()=>{
    this.searchText = null;
    console.log(this.searchText);
        
  });
  
    
}

  getSubCat(item) {
    this.closeNav();
    this.router.navigateByUrl('subcategories/' + item.categories_id);
    // this.catName = item.categories_name;
    // this._productService.getSubCategory(item.categories_id)
    // .subscribe( (res: any) => {
    //   console.log(res);
    //   this.subCategories = res.category;
    //   this.subCat = !this.subCat;
    // });
  }

  getCategories() {
    this._productService.getCategory()
    .subscribe( (data: any) => {
      this.categories = data.category;
      this._productService.catId = this.categories[0].categories_id;
      console.log('cats are ', data);
      // console.log('cats are ', this.categories);
    });
  }

  Auth() {
    this.router.navigateByUrl('login');
    this. closeNav();
  }

  // clickOut() {
  //   window.addEventListener('click', function(e){
  //     if (document.getElementById('mySidenav').contains(e.target)) {
  //     } else {
  //       document.getElementById('mySidenav').style.width = '0';
  //       document.getElementById('main').style.marginLeft = '0';
  //       document.body.style.backgroundColor = 'white';
  //     }
  //   });
  // }

}
