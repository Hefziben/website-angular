import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { Router, NavigationExtras } from "@angular/router";
import {ActivatedRoute} from '@angular/router';
import * as _ from "lodash";

import { productService } from '../../lib/service/product.service';


@Component({
    selector: 'my-app',
    templateUrl: './home2.component.html',
    styleUrls: ['./home2.component.scss'],
})
export class Home2Component implements OnInit {
    private position: number = 0;
    private widthRow: number;
    private widthCol: number;
    public categories: any[] = [];
    private init: boolean = false;
    public homeState: boolean = false;
    public loadingState: boolean = true;
    private navigateRoute = 'shop/product1';
    imgUrl = 'https://www.licenseplates.tv/images/';
    @ViewChild('row') row:ElementRef;
    subCategories: any;
    pages = [];
    currentPage = 0;
    id: any;
    pageOfItems: Array<any>;
    maxPages;
    initialPage;
    pageSize;
 
    

    constructor(
        private router: Router,
        private _productService: productService,
        private route: ActivatedRoute
    ) {}

    ngOnInit() {
        this.route.params.subscribe( params => {
            this.id = params.id;
            return this.getSubCat(params.id)
        });

        
    }

    onChangePage(pageOfItems: Array<any>) {
        // update current page of items
        this.pageOfItems = pageOfItems;
    }
    changePage(num) {
        console.log('num is ', num);
        this.currentPage = num;
        this.getSubCat(this.id);
    }
    getSubCat(id) {
        const numeric = new RegExp( "[0-9]").test(id);
       const alphanumerSearch = new RegExp( "[A-Za-z0-9]").test(id);
        if (numeric) {
          console.log("no letters, regular search");
          this._productService
            .getStaticSubCategory(id, this.currentPage)
            .subscribe((res: any) => {
              console.log("sub cat res---- ", res);
              this.subCategories = res.product_data;
              console.log("subCategories---- ", this.subCategories);
              this.pagination(res.total_record);
            });
        } if(alphanumerSearch) {
          console.log("lalphanumeric, search match");
          this._productService.getProductByName(id).subscribe(data => {
            this.subCategories = data["product"];
            const records = this.subCategories.length;
            console.log(this.subCategories);
            console.log(this.subCategories);
            this.pagination(records);
          });
        }       
           
      }

      getProduct(item) {
          this.router.navigateByUrl('producDetails/' + item.products_id);
      }

      pagination(val) {
          console.log('records ', val)
          if (val > 10) {
              // set pagination
            if ((val % 10) > 0) {
                console.log('more than one')
                let value: any = val / 10 ;
                let page = parseInt(value) + 1;
                this.arrFill(page);
            } else {
                let value: any = val / 10 ;
                let page = parseInt(value);
                this.arrFill(page);
            }
              
          } else {
              this.pages = [1];
          }
      }
      
      arrFill(n) {
          console.log('arr fill with ', n);
          this.pages = Array.from(Array(n).keys())
          console.log('pages are ', this.pages)
      }

    // ngAfterViewInit(){
    //     this.fetchCategory();
    // }

    // Event Listener
    @HostListener('window:resize', ['$event']) onResize(event) { 
        this.position = 0;

        setTimeout(()=>{
            this.widthCol = this.row.nativeElement.firstElementChild.offsetWidth - 1;            
            this.widthRow = (this.row.nativeElement.offsetWidth - this.widthCol) * -1; 
        }, 1000);
    }

    // Fetching Categori
    fetchCategory(){
        this._productService.getCategory().subscribe(data => {
            this.categories = [];
            _.map(data,(x)=>{
                this.categories.push(x);
            });

            this.loadingState = false;
            this.homeState = true;

            setTimeout(()=>{
                this.init = true;
                this.widthCol = this.row.nativeElement.firstElementChild.offsetWidth;            
                this.widthRow = (this.row.nativeElement.offsetWidth - this.widthCol) * -1;        
            }, 100);

        });
    }

    // Previous Slider
    prevSlide(){ 
        this.position = this.position + this.widthCol;
        this.widthRow = (this.row.nativeElement.offsetWidth - this.widthCol) * -1;      
    }

    // Next Slider
    nextSlide(){  
        this.position = this.position - this.widthCol;
        this.widthRow = ((this.row.nativeElement.offsetWidth - (this.widthCol + this.widthCol)) - 5) * -1;  
    }

    // Select Category
    selectCategory(e){
        let navCategory: NavigationExtras = {
            queryParams: {
                category: _.kebabCase(e)
            }
        };
        this.router.navigate([this.navigateRoute], navCategory);
    }
}
