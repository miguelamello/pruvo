import { Controller, Get, Query, HttpException, HttpStatus } from '@nestjs/common';
import * as validator from 'email-validator';
import { queryParams } from '../interfaces/queryParam.interface';
import BaseRates from '../interfaces/BaseRates';
import CalcRate from '/interfaces/CalcRate';
import { Message } from '../interfaces/message.interface';
import currencyCodes from './currency-codes';
import currencyNames from './currency-names';
import emptyBaserate from './empty-baserate';
import { AwsSqsService } from './aws-sqs.service';

@Controller('conversion')
export class ConversionController {

  // Open Exchange Rates account ID
  private openExchangeRatesApiKey = '147b750303264e2fa9de9af6d03974aa';

  // Base rate for the conversion
  private baseRates: BaseRates = emptyBaserate; 

  // Inject the SQS service
  constructor( private awsSqsService: AwsSqsService) {

    // Get the base rates from the remote API
    this.getRemoteBaseRates().then((rates) => {
      this.setBaseRates(rates);
    });

    // Subscribe to the observable to receive messages from the queue
    this.awsSqsService.getMessage$().subscribe((message) => {
      console.log('Message received:', message.body);
      // handle message here
    });
  }    

  private setBaseRates( rates: BaseRates ) {
    this.baseRates = rates;
  }

  private getBaseRates() { 
    return this.baseRates;
  }

  private async getRemoteBaseRates(): Promise<BaseRates> {
    const response = await fetch(`https://openexchangerates.org/api/latest.json?app_id=${this.openExchangeRatesApiKey}`);
    return await response.json();
  }

  private setCalcRates() {
    const base_rates = this.getBaseRates();
    if ( base_rates.success ) {
      for (const [key1, value1] of Object.entries(base_rates.rates)) {
        this.calc_rates[key1] = {};
        this.calc_rates[key1][key1] = 1.00;
        for (const [key2, value2] of Object.entries(base_rates.rates)) {
          if ( key1 === 'EUR') {
            this.calc_rates[key1][key2] = +(value2).toFixed(2) || 0; 
          } else {
            if ( key2 == 'EUR') {
              this.calc_rates[key1][key2] = +(1 / value1).toFixed(2) || 0; 
            } else {
              this.calc_rates[key1][key2] = +((1 / value1) * value2).toFixed(2) || 0;
            }
          }
        }
      }
    }
  }

  // Check if all required parameters are present and valid
  private checkParams(queryParams: queryParams) {
    // check if all 4 required parameters are present
    if ( !queryParams.from ) throw new HttpException(`Missing required query parameter: from`, HttpStatus.BAD_REQUEST);
    if ( !queryParams.to ) throw new HttpException(`Missing required query parameter: to`, HttpStatus.BAD_REQUEST);
    if ( !queryParams.amount ) throw new HttpException(`Missing required query parameter: amount`, HttpStatus.BAD_REQUEST);
    if ( !queryParams.email ) throw new HttpException(`Missing required query parameter: email`, HttpStatus.BAD_REQUEST);

    // check if all required parameters are valid type
    if ( !currencyCodes.some(item => queryParams.from.includes(item)) ) throw new HttpException(`Currency code ${queryParams.from} not found. Try access /conversion/codes for available currency codes.`, HttpStatus.BAD_REQUEST);
    if ( !currencyCodes.some(item => queryParams.to.includes(item)) ) throw new HttpException(`Currency code ${queryParams.to} not found. Try access /conversion/codes for available currency codes.`, HttpStatus.BAD_REQUEST);
    if ( isNaN(+queryParams.amount) ) throw new HttpException(`Amount must be a valid number. Ex: 35.50 or 150`, HttpStatus.BAD_REQUEST);
    if ( !validator.validate(queryParams.email) ) throw new HttpException(`Email must be a valid mail box name.`, HttpStatus.BAD_REQUEST);
  }

  // Queue an conversion request from the client and return a message if successful.
  @Get()  
  getConversion( @Query() queryParams: queryParams ): Message {

    this.checkParams(queryParams);
    this.awsSqsService.sendMessage(queryParams);
    return { 
      statusCode: true, 
      message: 'Soon you will receive an email with the conversion result. Thank you.' 
    }
  }

  // Return the available currency codes for conversion to the client.
  @Get('codes')  
  getCodes(): Message {

    return { 
      statusCode: true, 
      message: currencyNames
    }
  }
}
