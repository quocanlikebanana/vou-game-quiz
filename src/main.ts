import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { CatchEverythingFilter } from './common/error/all-exception.filter';
import { validationExceptionFactory } from './common/error/validation.handle.error';

async function bootstrap() {
	const port = process.env.PORT ?? 3000;
	const app = await NestFactory.create(AppModule);

	const httpAdapterHost = app.get(HttpAdapterHost);
	app.useGlobalFilters(new CatchEverythingFilter(httpAdapterHost));

	app.useGlobalPipes(new ValidationPipe({
		whitelist: true,
		transform: true,
		exceptionFactory: validationExceptionFactory,
	}));

	await app.listen(port);
	console.log(`[QuizGame Service] is running on: ${await app.getUrl()}`);
}
bootstrap();
