export interface Rider {
    user: {
        first_name: string;
        middle_name?: string;
        last_name: string;
        contact: string;
        email: string;
        email_verified_at: boolean
    },
    rider: {
        user: {
            first_name: string;
            middle_name?: string;
            last_name: string;
            contact: string;
            email: string;
            email_verified_at: boolean
        }
        license_number: string;
        plate_number: string;
        rating: number;
    },
    id: number;
    

}