import { sqlInjectionLab } from "./labs/sqlInjection";
import { mitmLab } from "./labs/mitm";
import { xssLab } from "./labs/xss";
import { idorLab } from "./labs/idor";
import { LabScenario } from "./types";

export const ALL_LABS: LabScenario[] = [
    sqlInjectionLab,
    xssLab,
    mitmLab,
    idorLab
];

export const getLabById = (id: string) => ALL_LABS.find(l => l.id === id);
