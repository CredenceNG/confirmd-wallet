import {
  ProofRequestTemplate,
  ProofRequestType,
} from "./types/proof-reqeust-template";

export const useProofRequestTemplates = (acceptDevRestrictions?: boolean) => {
  
  const defaultProofRequestTemplates: Array<ProofRequestTemplate> = [
    {
      id: "student-verification",
      name: "Student Verification",
      description: "Verify student first and last name",
      version: "1.0.0",
      devOnly: false,
      payload: {
        type: ProofRequestType.AnonCreds,
        data: [
          {
            schema: "student_card_schema",
            requestedAttributes: [
              {
                name: "student_first_name",
                restrictions: [
                  {
                    cred_def_id:
                      "XUxBrVSALWHLeycAUhrNr9:3:CL:26293:student_card",
                  },
                ],
              },
              {
                name: "student_last_name",
                restrictions: [
                  {
                    cred_def_id:
                      "XUxBrVSALWHLeycAUhrNr9:3:CL:26293:student_card",
                  },
                ],
              },
            ],
          },
        ],
      },
    },
    {
      id: "age-verification",
      name: "Age Verification",
      description: "Prove you are over 18 without revealing exact age",
      version: "1.0.0",
      payload: {
        type: ProofRequestType.AnonCreds,
        data: [
          {
            schema: "government_id_schema",
            requestedPredicates: [
              {
                name: "age",
                predicateType: ">=",
                predicateValue: 18,
                restrictions: [
                  {
                    cred_def_id: "Gov123:3:CL:456:government_id",
                  },
                ],
              },
            ],
          },
        ],
      },
    },
  ];

  // Filter based on dev restrictions if needed
  if (acceptDevRestrictions === false) {
    return defaultProofRequestTemplates.filter(template => !template.devOnly);
  }
  
  return defaultProofRequestTemplates;
};
