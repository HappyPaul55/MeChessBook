import { useForm, SubmitHandler, Controller } from "react-hook-form"
import type { User as LichessUser } from "../../lichess";
import { Settings } from "../../types";
import useTranslation from "next-translate/useTranslation";

function Selector<T extends string>(props: {
  setValue: (value: T) => void,
  value: T,
  title: string,
  options: T[]
}) {
  const { t } = useTranslation('common');

  return <div className="text-white">
    <h3 className="text-lg">{t(`form.settings.${props.title}.title`)}</h3>
    <div className="row flex w-full gap-4">
      {
        props.options.map(option => <button
          key={option}
          className={`py-3 rounded-lg  text-purple-600 font-semibold transition duration-300 cursor-pointer w-full ${option === props.value
            ? 'bg-purple-700 text-white hover:bg-purple-800'
            : 'bg-white text-purple-600 hover:bg-purple-100'
            }
          `}
          type="button"
          onClick={() => {
            props.setValue(option)
          }}
        >
          {t(`form.settings.${props.title}.options.${option}`)}
        </button>)
      }
    </div>
  </div>

}

export default function FormSettings(
  props: {
    user: LichessUser;
    setSettings: (settings: Settings) => void;
  },
) {
  const { t } = useTranslation("common");
  const {
    handleSubmit,
    control,
  } = useForm<Settings>({
    defaultValues: {
      pageSize: "A5",
      color: "all",
      result: "all",
      rated: "all",
      analysed: "all",
      dateRange: "last-month",
    }
  })
  const onSubmit: SubmitHandler<Settings> = (data) => props.setSettings(data)

  return (
    <>
      <h1 className="text-3xl font-bold text-white mb-6 text-center drop-shadow-lg">
        {t('form.settings.title')}
      </h1>
      <form
        className="flex flex-col gap-4"
        onSubmit={handleSubmit(onSubmit)}
      >
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
        <details>
          <summary className="text-white cursor-pointer">Show Advanced Settings... </summary>
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
        <button
          type="submit"
          className="mt-4 py-3 rounded-lg bg-white text-purple-600 font-semibold hover:bg-purple-100 transition duration-300 cursor-pointer"
        >
          {t('form.settings.submit')}
        </button>
      </form>
    </>
  );
}
