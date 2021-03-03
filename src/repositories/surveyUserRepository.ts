import { EntityRepository, Repository } from "typeorm";
import { SurveyUser } from "../models/surveyUser";

@EntityRepository(SurveyUser)
export class SurveyUserRepository extends Repository<SurveyUser>{

}