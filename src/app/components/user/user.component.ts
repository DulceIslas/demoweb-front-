import { Component, OnInit } from '@angular/core';
import {UserService} from '../../services/user.service';
import {User} from '../../models/user.model';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {

  users: User[] = [];
  constructor(private userService: UserService) { }

  ngOnInit(): void {
    this.userService.getCustomersAll().then((data:User[])=>{
      this.users = data;
    });
  }

}
