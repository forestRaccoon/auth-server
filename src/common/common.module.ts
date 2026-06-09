import { Global, Module } from '@nestjs/common';
import { I18nService } from './services/i18n.service';
import { SanitizeService } from './services/sanitize.service';
import { IsEmailCustomConstraint } from './validators/is-email-custom.validator';
import { IsPasswordStrongConstraint } from './validators/is-password-strong.validator';
import { IsFullNameConstraint } from './validators/is-fullname.validator';
import { IsResetCodeConstraint } from './validators/is-reset-code.validator';

@Global()
@Module({
    providers: [
        I18nService,
        SanitizeService,
        IsEmailCustomConstraint,
        IsPasswordStrongConstraint,
        IsFullNameConstraint,
        IsResetCodeConstraint,
    ],
    exports: [
        I18nService,
        SanitizeService,
        IsEmailCustomConstraint,
        IsPasswordStrongConstraint,
        IsFullNameConstraint,
        IsResetCodeConstraint,
    ],
})
export class CommonModule {}