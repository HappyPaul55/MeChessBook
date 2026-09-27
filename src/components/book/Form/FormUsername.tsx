import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { t } from "../../../lib/i18n";
import { buttonClass } from "../../../lib/button";

type Inputs = {
  username: string;
};

export default function FormUsername(
  props: { error: boolean; setUsername: (username: string) => void },
) {
  const { register, handleSubmit } = useForm<Inputs>();
  const onSubmit: SubmitHandler<Inputs> = (data) =>
    props.setUsername(data.username);

  return (
    <>
      <h2 className="panel__title mb-1">{t("project.title")}</h2>
      <p className="mb-6 text-sm text-ink-soft">
        Enter a Lichess username to begin.
      </p>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit(onSubmit)}>
        {props.error && (
          <div role="alert" className="alert alert--error">
            {t("form.username.username.invalid")}
          </div>
        )}
        <div>
          <label className="field-label" htmlFor="lichess-username">
            {t("form.username.username.placeholder")}
          </label>
          <input
            id="lichess-username"
            className="input"
            autoComplete="off"
            autoCapitalize="none"
            spellCheck={false}
            {...register("username")}
            placeholder={t("form.username.username.placeholder")}
          />
        </div>
        <button type="submit" className={buttonClass("primary", "w-full")}>
          {t("form.username.submit")}
        </button>
      </form>
    </>
  );
}
