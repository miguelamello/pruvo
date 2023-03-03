import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ConversionService } from './conversion.service';
import { queryParams } from './interfaces/queryParam.interface';

@Controller('conversion')
export class ConversionController {

  constructor(private conversionService: ConversionService) {}

  private checkParams(queryParams: queryParams) {
    // check if all 4 required parameters are present
    if (!queryParams.from) throw new BadRequestException(`Missing required query parameter(s): `,);
    
  }

  @Get()
  getConversion(
    @Query() queryParams: queryParams,
  ) {

    this.checkParams(queryParams);
    

    return this.conversionService.registerConservion();
    
  }

}
