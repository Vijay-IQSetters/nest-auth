import { IsEmail, Matches, MinLength } from 'class-validator';
export class SignupDto {
  @IsEmail()
  email!: string;

  @MinLength(8)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).+$/, {
    message:
      'Password must include uppercase, lowercase, number, and special character',
  })
  password!: string;
}
