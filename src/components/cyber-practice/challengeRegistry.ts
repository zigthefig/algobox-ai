import { xssChallenge } from "./challenges/xss";
import { sqlInjectionChallenge } from "./challenges/sqlInjection";
import { idorChallenge } from "./challenges/idor";
import { pathTraversalChallenge } from "./challenges/pathTraversal";
import { commandInjectionChallenge } from "./challenges/commandInjection";
import { fileUploadChallenge } from "./challenges/fileUpload";
import { SecurityChallenge } from "./types";

export const ALL_CHALLENGES: SecurityChallenge[] = [
    xssChallenge,
    sqlInjectionChallenge,
    idorChallenge,
    pathTraversalChallenge,
    commandInjectionChallenge,
    fileUploadChallenge
];

export const getChallengeById = (id: string) => ALL_CHALLENGES.find(c => c.id === id);
