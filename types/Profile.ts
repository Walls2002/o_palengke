export interface Profile {
  id: number;
  first_name: string;
  last_name: string;
  middle_name: string;
  email: string;
  contact: string;
  location_id: number;
  profile_picture: string;
  formatted_location?:string
}

export interface UserCredentials {
  old_password: string;
  new_password: string;
  confirm_password: string;
}
