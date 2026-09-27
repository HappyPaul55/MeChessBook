import { useForm, Controller } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import type { User as LichessUser } from "../../../lib/lichess";
import type { Settings } from "../../../lib/types";
import { t } from "../../../lib/i18n";
import { buttonClass } from "../../../lib/button";
import { DEFAULT_PAGE_SIZE } from "../../../lib/book";

function Selector<T extends string>(props: {
  setValue: (value: T) => void;
  value: T;
  title: string;
  options: T[];
}) {
  return (
    <fieldset className="mb-5">
      <legend className="field-label">
        {t(`form.settings.${props.title}.title`)}
      </legend>
      <div className="choice-group">
        {props.options.map((option) => (
          <button
            key={option}
            className="choice"
            type="button"
            aria-pressed={option === props.value}
            onClick={() => {
              props.setValue(option);
            }}
          >
            {t(`form.settings.${props.title}.options.${option}`)}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

export default function FormSettings(
  props: {
    user: LichessUser;
    setSettings: (settings: Settings) => void;
  },
) {
  const { handleSubmit, control } = useForm<Settings>({
    defaultValues: {
      pageSize: DEFAULT_PAGE_SIZE,
      color: "all",
      result: "all",
      rated: "all",
      analysed: "all",
      dateRange: "last-month",
    },
  });
  const onSubmit: SubmitHandler<Settings> = (data) => props.setSettings(data);

  return (
    <>
      <h2 className="panel__title mb-6">{t("form.settings.title")}</h2>
      <form className="flex flex-col" onSubmit={handleSubmit(onSubmit)}>
        <Controller
          name="analysed"
          control={control}
          render={({ field }) => (
            <Selector
              value={field.value}
              title={field.name}
              options={["all", "only"]}
              setValue={field.onChange}
            />
          )}
        />

        <Controller
          name="result"
          control={control}
          render={({ field }) => (
            <Selector
              value={field.value}
              title={field.name}
              options={["wins", "all", "losses"]}
              setValue={field.onChange}
            />
          )}
        />

        <Controller
          name="rated"
          control={control}
          render={({ field }) => (
            <Selector
              value={field.value}
              title={field.name}
              options={["rated", "all"]}
              setValue={field.onChange}
            />
          )}
        />

        <Controller
          name="color"
          control={control}
          render={({ field }) => (
            <Selector
              value={field.value}
              title={field.name}
              options={["white", "all", "black"]}
              setValue={field.onChange}
            />
          )}
        />

        <Controller
          name="pageSize"
          control={control}
          render={({ field }) => (
            <Selector
              value={field.value}
              title={field.name}
              options={["A4", "A5"]}
              setValue={field.onChange}
            />
          )}
        />

        <details className="mb-2">
          <summary className="cursor-pointer font-mono text-[0.78rem] font-bold uppercase tracking-[0.06em] text-muted">
            {t("form.settings.advanced")}
          </summary>
          <div className="mt-4">
            <Controller
              name="dateRange"
              control={control}
              render={({ field }) => (
                <Selector
                  value={field.value}
                  title={field.name}
                  options={["all", "last-month", "last-year"]}
                  setValue={field.onChange}
                />
              )}
            />
          </div>
        </details>

        <button type="submit" className={buttonClass("primary", "mt-2 w-full")}>
          {t("form.settings.submit")}
        </button>
      </form>
    </>
  );
}
