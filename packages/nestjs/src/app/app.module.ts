import { join } from 'path';

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';

import { UploaderModule } from '../uploader/uploader.module';
import configuration from '../config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      isGlobal: true,
    }),
    // TypeOrmModule.forRootAsync({
    //   // https://github.com/nestjsx/nestjs-config/issues/19
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => {
    //     return Object.assign(
    //       {
    //         type: 'mysql', // or mongoose
    //         database: 'test',
    //         entities: [User],
    //         synchronize: true,
    //         retryAttempts: 0,
    //       },
    //       configService.get('mysql'),
    //     );
    //   },
    //   inject: [ConfigService],
    // }),
    // UsersModule,
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     uri: configService.get('mg1').url,
    //   }),
    //   inject: [ConfigService],
    //   connectionName: 'cats',
    // }),
    // MongooseModule.forRootAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     uri: configService.get('mg2').url,
    //   }),
    //   inject: [ConfigService],
    //   connectionName: 'gql',
    // }),
    // GraphQLModule.forRoot({
    //   autoSchemaFile: join(process.cwd(), 'src/schema.gql'),
    //   sortSchema: true,
    //   playground: true,
    //   debug: false,
    // }),
    // PersonModule,
    // HobbyModule,
    // CatsModule,
    UploaderModule,
    ServeStaticModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return [
          {
            rootPath: configService.get('CLIENT_DIR'),
            serveStaticOptions: {
              fallthrough: false,
              index: ['index.html']
            }
          },
          {
            rootPath: configService.get('UPLOAD_DIR'),
            // need the `/` prefix
            serveRoot: '/uploads',
            serveStaticOptions: {
              fallthrough: false,
              index: false,
            }
          },
        ];
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
