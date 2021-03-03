import { Request, Response } from "express";
import { resolve } from 'path';
import { getCustomRepository } from "typeorm";
import { AppError } from "../errors/appError";
import { SurveyRepository } from "../repositories/surveyRepository";
import { SurveyUserRepository } from "../repositories/surveyUserRepository";
import { UserRepository } from "../repositories/userRepository";
import SendMailService from "../services/sendMailService";

export class SendMailController {
    async execute(request: Request, response: Response) {
        const { email, survey_id } = request.body;

        const userRepository = getCustomRepository(UserRepository);
        const surveyRepository = getCustomRepository(SurveyRepository);
        const surveyUserRepository = getCustomRepository(SurveyUserRepository);

        const userAlreadyExists = await userRepository.findOne({email});

        if(!userAlreadyExists) {
            return response.status(400).json({
                error: "User does not exists"
            })
        }

        const surveyAlreadyExists = await surveyRepository.findOne({ id: survey_id });

        if(!surveyAlreadyExists){
            throw new AppError("Survey does not exists");
        }

        const npsPath = resolve(__dirname, "..", "views", "emails", "npsMail.hbs");

        const surveyUserAlreadyExists = await surveyUserRepository.findOne({
            where: [{user_id: userAlreadyExists.id, value: null}],
            relations: ["user", "survey"]
        })

        const variables = {
            name: userAlreadyExists.name,
            title: surveyAlreadyExists.title,
            description: surveyAlreadyExists.description,
            id: "",
            link: process.env.URL_MAIL
        }

        if (surveyUserAlreadyExists){
            variables.id = surveyUserAlreadyExists.id;
            await SendMailService.execute(email, surveyAlreadyExists.title, variables, npsPath);
            return response.json(surveyUserAlreadyExists);
        }

        const surveyUser = surveyUserRepository.create({
            user_id: userAlreadyExists.id,
            survey_id: survey_id
        })

        await surveyUserRepository.save(surveyUser);
        
        variables.id = surveyUser.id;

        await SendMailService.execute(email, surveyAlreadyExists.title, variables, npsPath);

        return response.json(surveyUser);
    }
}