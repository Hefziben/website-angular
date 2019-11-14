import { Component, OnInit } from '@angular/core';
import { AuthService } from 'app/lib/service/auth/auth.service';
import { Router } from '@angular/router';
import { ResponseOptions } from '@angular/http';
import { productService } from 'app/lib/service/product.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loading: boolean;
  model: any = {};
  user: any = {};
  fullName: string;
  message: any;
  fpass: boolean;
  success: boolean;
  error: boolean;
  resMessage;
  show: boolean = true;
  Countries: any;
  state: boolean;
  States: any;
  constructor(public _authService: AuthService, public router: Router, public _productService: productService) { }

  ngOnInit() {
  
    
  }

  authCheck() {
    this.loading = true;
    this.message = '';
    this._authService.login(this.user)
    .subscribe( (res: any) => {
      console.log(res);
      this.loading = false;
      if (res.success == 1) {
        this.message = res.message;
        // this.fullName = res.firstname + ' ' + res.lastname;
        let currentUser = {
          firstname : res.firstname,
          lastname : res.lastname,
          loggedIn: true
        }
        localStorage.currentUser = JSON.stringify(currentUser);
        this._productService.loggedData(true);
        this.router.navigateByUrl('cart')
      } else {
        this.message = res.message;
      }

    }, err => {
      console.log(err.statusText);
      this.loading = false;
      this.message = err.statusText;
    })
  }

  forgotPass() {
    this.fpass = true;
  }

  back() {
    this.fpass = false;
    this.error = false;  
    this.show = false; 
    this.model = {} 
    this.resMessage = null;
    this.success = false;
      
   
  }

  restart(){
    console.log('here');
    
  }
  resetPass() {
    console.log(this.model);    
    this._authService.forgotPassword(this.model).subscribe(res =>{
      this.resMessage = res['message'];
      console.log(res);
      if(this.resMessage == "There is no account with this email address"){
        console.log(this.resMessage); 
        this.error = true; 
        //alert(resMessage);      
        return
      } else {
        this.model = {}
        this.success = true;
        this.error = false;
        this.resMessage = null;
      }
      
    })
  }


  authCheck2() {
    alert('Under Development!')
  }
  signup(){
    this.router.navigate(['signup']);
  }
}
