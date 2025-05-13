import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  Req,
  UseInterceptors,
  UploadedFile,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { CloudinaryService } from 'src/cloudinary.services';
import { CloudinaryStorageConfig } from 'src/config/cloudinary-storage.config';
import { Public } from 'src/decorators/publicroute.decorator';

@Controller('events')
export class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly cloudinaryService: CloudinaryService,
  ) {}

  @Post('create')
  // @UsePipes(ValidationPipe)
  @UsePipes(new ValidationPipe({ transform: true }))
  async create(
    @Body() createEventDto: CreateEventDto,
    @Req() request: Request,
  ) {

    const userId = request['user'].sub; // user id gotten from the token
    return this.eventsService.create(createEventDto, userId);
  }

  // get events that are for a particular user.
  @Get('all')
  findAll(@Req() request: Request) {
    const userId = request['user'].sub;
    return this.eventsService.findAll(userId);
  }

  // get a particular event for a particular user---the id is the id of the event
  @Get(':id')
  findOne(@Param('id') id: string, @Req() request: Request) {
    const userId = request['user'].sub;
    return this.eventsService.findOne(id, userId);
  }

  @Public()
  @Get('basic/:id')
  findEventInfo(@Param('id') id: string) {
    return this.eventsService.findOneEvent(id);
  }

  // user can edit there events
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEventDto: UpdateEventDto,
    @Req() request: Request,
  ) {
    const userId = request['user'].sub;
    return this.eventsService.update(id, updateEventDto, userId);
  }

  // user can delete a particular event.
  @Delete(':id')
  remove(@Param('id') id: string, @Req() request: Request) {
    const userId = request['user'].sub;
    return this.eventsService.remove(id, userId);
  }

}
