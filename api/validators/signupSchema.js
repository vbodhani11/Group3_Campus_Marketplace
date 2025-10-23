const z = require("zod");

function buildSignupSchema(campusDomainEnv) {
    const campusDomain = (campusDomainEnv || '').toLowerCase().trim();  //  If var is falsy ensures it's ''

    return z.object({
        email: z.email("Invalid email")   //  Takes in a string as an email
        .transform(s => s.toLowerCase().trim()) //  Processes the inputted email
        .refine(
            (email) => campusDomain && email.endsWith(`@${campusDomain}`),
            { message: `Use your ${campusDomain} email.`}
        ),  //  End of the email section
        password: z.string().min(8, `Password must be atleast 8 chars`),
        confirmPassword: z.string().min(8, `Password must be atleast 8 chars`),
    })
    .refine((input) => input.password === input.confirmPassword, {
        message: `Mismatch passwords`,
        path: ["confirmPassword"],
    });
}

module.exports = {buildSignupSchema};   