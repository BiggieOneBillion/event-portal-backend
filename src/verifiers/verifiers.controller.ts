// src/verifier/verifier.controller.ts
import { Controller, Post, Param, Delete } from '@nestjs/common';
import { VerifierService } from './verifiers.service';
import { Body } from '@nestjs/common';
import { Public } from 'src/decorators/publicroute.decorator';

@Controller('verifier')
export class VerifierController {
  constructor(private readonly verifierService: VerifierService) {}

  // Endpoint to generate verifier credentials for an event
  @Public()
  @Post('generate/:eventId')
  async generateVerifier(@Param('eventId') eventId: string) {
    return this.verifierService.generateVerifier(eventId);
  }

  // Endpoint to verify login credentials
  @Public()
  @Post('login')
  async verifyLogin(
    @Body('email') email: string,
    @Body('password') password: string,
  ) { 
    return this.verifierService.validateVerifier(email, password);
  }

  @Delete('details/:id')
  removeVerifiers(@Param('id') id: string){
     return this.verifierService.deleteVerifierDetails(id)
  }
}
